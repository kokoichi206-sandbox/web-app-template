import process from "node:process";

import { defineConfig, env } from "prisma/config";

const loadEnvFileIfExists = (path: string) => {
  try {
    process.loadEnvFile(path);
  } catch {
    // Ignore missing env files. `env("DATABASE_URL")` validates at config load.
  }
};

loadEnvFileIfExists(".env.local");
loadEnvFileIfExists(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
