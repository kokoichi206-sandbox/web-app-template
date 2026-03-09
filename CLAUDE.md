# AGENTS.md

このリポジトリで動かす各エージェント向けの共通ガイド（Claude / GPT / Gemini など）。

## WHY - プロジェクトの目的

Wareware-PJ の Next.js プロジェクトテンプレート。レイヤードアーキテクチャ・ESLint カスタムルール・CI/CD パターンを標準化し、新規プロジェクトの品質ベースラインを提供する。

## WHAT - 技術スタック

Next.js 15 (App Router) / React 19 / TypeScript / PostgreSQL + Prisma ORM / Tailwind CSS 4 / ESLint + Prettier / Pino / Zod

パッケージマネージャ: **pnpm 10.26.0** (npm/yarn 禁止)

## ディレクトリ構造

- `src/app/` - Next.js App Router (routes, api/)
- `src/client/` - クライアント専用 (components/, hooks/)
- `src/server/` - サーバー専用 (db/, repositories/, usecases/, handlers/, lib/adapters/)
- `src/shared/` - 共通 (env/, logger/, result.ts)
- `src/types/` - 型定義
- `prisma/` - スキーマ・マイグレーション
- `.claude/rules/` - コンテキスト別の実装ルール

## HOW - 開発コマンド

```bash
pnpm dev              # 開発サーバー
pnpm build            # ビルド
pnpm lint             # ESLint チェック (--max-warnings 0)
pnpm lint:fix         # ESLint 自動修正
pnpm format           # Prettier フォーマット
pnpm format:check     # Prettier チェック
pnpm type-check       # TypeScript 型チェック
pnpm test             # テスト実行
pnpm knip             # 未使用コード検出

# DB操作
pnpm db:push          # スキーマ反映 (開発用)
pnpm db:generate      # Prisma Client 生成
pnpm db:studio        # Prisma Studio 起動
```

## 設計方針

- **依存方向**: `app → handlers → usecases → repositories → db` + `lib/adapters/`
- **Server Actions 優先**: API Route は OAuth callback・Webhook・ファイルダウンロード等に限定
- **レイヤー分離**: `src/server/` 外からは `@/server/handlers/*` のみ import 可能（ESLint で強制）
- **Result 型**: サーバーコードでは throw を使わず、Result 型で統一的にエラーを扱う（ESLint で強制）
- **環境変数**: `process.env` 直接参照禁止 → `@/shared/env/server-env.ts` 経由で参照（ESLint で強制）
- **DB 変更**: スキーマ編集 → `pnpm db:generate` → マイグレーションを PR に同梱
- **DB 命名規則**: テーブル名は複数形 snake_case、カラム名は snake_case

## 詳細ドキュメント

### 実装パターンとルール

- **サーバーサイド境界**: [.claude/rules/server-side-boundaries.md](.claude/rules/server-side-boundaries.md)
- **エラーハンドリング**: [.claude/rules/error-handling.md](.claude/rules/error-handling.md)
- **Repository 層**: [.claude/rules/repository-patterns.md](.claude/rules/repository-patterns.md)
- **UseCase 層**: [.claude/rules/usecase-patterns.md](.claude/rules/usecase-patterns.md)
- **外部 API アダプター**: [.claude/rules/external-api-adapters.md](.claude/rules/external-api-adapters.md)
- **DB マイグレーション**: [.claude/rules/database-migrations.md](.claude/rules/database-migrations.md)
- **コーディングベストプラクティス**: [.claude/rules/coding-best-practices.md](.claude/rules/coding-best-practices.md)

### その他

- **ESLint 設定**: [eslint.config.mjs](eslint.config.mjs)
- **Prettier 設定**: [.prettierrc.json](.prettierrc.json)
