/**
 * Invalid API route handler - over 80 lines
 * This file SHOULD trigger the max-api-route-handler-lines rule
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

import archiver from "archiver";
import { NextResponse } from "next/server";

import { logger } from "@/shared/logger";

const EXTENSION_DIR_NAME = "google-ads-change-history-exporter";
const EXTENSION_BASE_PATH = join(process.cwd(), "chrome-extension", EXTENSION_DIR_NAME);

const EXCLUDE_PATTERNS = [
  ".DS_Store",
  "node_modules",
  ".git",
  ".vscode",
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
];

const getFilesRecursively = async (dir: string): Promise<string[]> => {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (EXCLUDE_PATTERNS.some((pattern) => entry.name.includes(pattern))) {
      continue;
    }

    if (entry.isDirectory()) {
      const subFiles = await getFilesRecursively(fullPath);
      files.push(...subFiles);
    } else {
      files.push(fullPath);
    }
  }

  return files;
};

const getExtensionVersion = async (): Promise<string> => {
  const manifestPath = join(EXTENSION_BASE_PATH, "manifest.json");
  try {
    const content = await readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(content) as { version?: string };
    return manifest.version ?? "1.0.0";
  } catch {
    return "1.0.0";
  }
};

export const GET = async () => {
  try {
    try {
      await stat(EXTENSION_BASE_PATH);
    } catch {
      logger.error({ path: EXTENSION_BASE_PATH }, "拡張機能ディレクトリが見つかりません");
      return NextResponse.json({ error: "拡張機能が見つかりません" }, { status: 404 });
    }

    const files = await getFilesRecursively(EXTENSION_BASE_PATH);

    if (files.length === 0) {
      logger.error("拡張機能ディレクトリが空です");
      return NextResponse.json({ error: "拡張機能ファイルが見つかりません" }, { status: 404 });
    }

    const version = await getExtensionVersion();
    const filename = `app-extension-v${version}.zip`;

    const chunks: Buffer[] = [];
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    for (const filePath of files) {
      const relativePath = relative(EXTENSION_BASE_PATH, filePath);
      const content = await readFile(filePath);
      archive.append(content, { name: relativePath });
    }

    await archive.finalize();

    const zipBuffer = Buffer.concat(chunks);

    logger.info(
      { filename, fileCount: files.length, size: zipBuffer.length },
      "拡張機能 ZIP を生成しました"
    );

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    logger.error({ err: error }, "拡張機能ダウンロード中にエラーが発生しました");
    return NextResponse.json({ error: "ダウンロード中にエラーが発生しました" }, { status: 500 });
  }
};
