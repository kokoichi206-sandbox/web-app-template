# web-app-template

Wareware-PJ の Next.js プロジェクトテンプレート。
レイヤードアーキテクチャ・ESLint カスタムルール・CI/CD パターンを標準化し、新規プロジェクトの品質ベースラインを提供する。

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript 5 (厳格モード)
- **UI**: React 19 + Tailwind CSS 4
- **ORM**: Prisma 6
- **ロギング**: Pino
- **バリデーション**: Zod 4
- **テスト**: Vitest + Testing Library
- **リンター**: ESLint 9 (Flat Config) + 18 カスタムルール
- **フォーマッター**: Prettier
- **パッケージマネージャー**: pnpm 10.26.0

## セットアップ

### 1. リポジトリをコピー

```bash
# GitHub の "Use this template" ボタンでリポジトリを作成するか、手動でコピー
gh repo create your-org/your-project --template Wareware-PJ/web-app-template --private
cd your-project
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して実際の値を設定:

| 変数名                | 説明                                                | 必須 |
| --------------------- | --------------------------------------------------- | ---- |
| `NEXT_PUBLIC_APP_ENV` | 環境識別子 (`local` / `development` / `production`) | Yes  |
| `NEXT_PUBLIC_APP_URL` | アプリケーション URL                                | Yes  |
| `DATABASE_URL`        | PostgreSQL 接続文字列                               | Yes  |

### 4. データベースのセットアップ

PostgreSQL を用意し、`DATABASE_URL` を設定した上で:

```bash
# スキーマを DB に反映（開発用）
pnpm run db:push

# マイグレーションファイルを生成（本番用）
# prisma/migrations/ にマイグレーションファイルが作られる
npx prisma migrate dev --name init

# Prisma Client の生成
pnpm run db:generate
```

### 5. 開発サーバーの起動

```bash
pnpm run dev
```

## Agent による自動セットアップ

上記の手動セットアップの代わりに、以下のプロンプトを Claude Code などの AI エージェントに貼り付けて実行すると、プロジェクト固有の設定を対話的にセットアップできる。

用途別にプロンプトを用意している:

- **既存プロジェクトへ移植したい場合**: テンプレートの運用エッセンス（CI/CD、Claude Code 設定、Docs、Storybook、Custom ESLint など）を段階的に取り込む
- **新規プロジェクトの場合**: web-app-template から作成されたプロジェクトの初期セットアップを行う

既存プロジェクトへ移植したい場合は、以下の「移植用プロンプト」を移植先リポジトリのルートで AI エージェントに貼り付けて実行する。

<details>
<summary>既存プロジェクト移植用プロンプトを表示 (クリックで展開)</summary>

````text
このリポジトリは既存プロジェクト（移植先）です。
ローカルにクローン済みの「web-app-template」リポジトリを参照し、以下の要素を “壊さず段階的に” 移植してください。
各ステップで必要な情報を質問し、回答に基づいて設定を反映してください（不明点があれば先に質問する）。

移植したい観点（必須）:
- CI/CD
- Claude Code / AI Agent 向けのリポジトリ設定（CLAUDE.md / AGENTS.md / .claude/ など、テンプレにあるものを踏襲）
- Documentation（README、開発手順、運用ルール）
- Storybook
- Custom ESLint 設定（テンプレの独自ルール運用を含む）

追加で提案してよい観点（任意。増やしすぎない）:
- Formatter / EditorConfig（Prettier/Biome/.editorconfig）
- Git hooks（lint-staged + husky/lefthook）
- セキュリティ（Dependabot/CodeQL/secret scan）
- リリース運用（Changesets 等）

重要な制約:
- 既存のアプリ挙動・ビルド・デプロイを壊さないことが最優先。
- 既存設定ファイルは無条件に上書き禁止。必ず差分比較して「マージ方針」を決めてから変更する。
- 変更は PR にしやすい単位に分割（巨大 diff 禁止）。最低でも以下で分割:
  - PR1: Docs / Agent 設定
  - PR2: ESLint / Formatter（必要なら）
  - PR3: Storybook
  - PR4: CI（lint/typecheck/test/build）
  - PR5: CD（必要なら。deploy は別 workflow でも可）
- ターゲットが採用しているパッケージマネージャ（npm/yarn/pnpm）と Node バージョンに合わせる。テンプレ側の前提が違えばターゲットに寄せる。

デフォルト前提:
- CI は GitHub Actions を想定（別の場合は最初に確認して切り替える）

## Step 0: テンプレート repo の場所を確認（最初に 1 回だけ質問）
次を質問し、回答を待ってください。

質問:
- 「ローカルにクローンしたテンプレート（web-app-template）リポジトリの絶対パスを入力してください」

パスの調べ方（Mac/Linux 前提）:
- テンプレ repo に移動して `pwd` を実行すると絶対パスが出ます
  - 例: `cd /path/to/web-app-template && pwd`
- Finder でフォルダを開けるなら、ターミナルで `cd ` を入力してフォルダをドラッグ&ドロップ → Enter → `pwd`
- すでに場所が分かっているなら `ls` で確認してから `cd /そのパス` → `pwd`

入力されたパスは TEMPLATE_REPO と呼ぶ。存在確認は `test -d "<TEMPLATE_REPO>"` で行ってよい。

## Step 1: 現状把握（ターゲット repo）
最低限、以下を確認してください（出力は要点のみでよい）:
- フレームワーク（Next.js/Vite/Node API 等）
- TypeScript の有無
- package manager（npm/yarn/pnpm）と主要 scripts
- 既存の CI（GitHub Actions 等）の有無
- ESLint/Prettier/Biome の有無と設定形式
- Storybook の有無

## Step 2: テンプレ側の移植候補ファイルを抽出
TEMPLATE_REPO を読み、観点ごとに移植候補を列挙してください（例）:
- CI/CD: `.github/workflows/*`, `scripts/*`
- Docs: `README.md`（該当セクション）, `CLAUDE.md`（または AGENTS.md）, `.claude/`
- Storybook: `.storybook/*`, Storybook 関連 scripts
- ESLint: `eslint.config.mjs`, `eslint-rules/`（独自ルール）

## Step 3: PR 分割計画を提示（実装前に短く）
以下を提示してから実装してください:
- PR ごとの目的
- 触るファイル一覧
- 想定リスク（既存ルールとの衝突、CI の環境差、Storybook のビルド失敗など）と回避策

## Step 4: 実装（段階導入）
### 4.1 Docs / Agent 設定
- ターゲット repo 向けに、AI エージェントが迷わない「実在するコマンド」「ディレクトリ構造」「禁止事項（巨大 diff 禁止、上書き禁止）」を明記する。

### 4.2 ESLint（Custom）
- 既存ルールを尊重しつつ、テンプレの価値が高いものから段階導入する。
- いきなり違反だらけにしない（必要なら warning 運用や段階的 error 化）。
- scripts を用意（例: `lint`, `lint:fix`）。

### 4.3 Storybook
- 起動（`storybook`）かビルド（`build-storybook`）のどちらかは必ず通す。可能なら両方。
- 既存の UI/構成に合わせ、最小の導入にする。

### 4.4 CI/CD
- まずは CI（lint/typecheck/test/build）を安定化。
- Storybook を CI に入れるなら `build-storybook` を実行し、成果物を artifact にするかは任意。
- deploy が絡む場合は secrets/環境変数を一覧化し、可能なら deploy workflow を分離する。

## Step 5: 最終出力
最後に以下をまとめてください:
- PR 分割案（最終形）と各 PR の変更ファイル一覧
- 追加/変更した package.json scripts
- CI のジョブ概要（何がいつ走るか）
- 必要な Secrets / 環境変数リスト
- 残課題（段階的に厳しくできるポイント）
````

</details>

<details>
<summary>新規プロジェクト初期セットアップ用プロンプトを表示 (クリックで展開)</summary>

````text
このリポジトリは web-app-template から作成された新規プロジェクトです。
以下の手順でプロジェクト固有の初期セットアップを実施してください。
各ステップで必要な情報を質問し、回答に基づいて設定を反映してください。

デフォルト構成: Supabase (ローカル開発) + Supabase Auth + Vercel
異なる構成を希望する場合は各ステップで変更可能です。

## Step 1: プロジェクト情報

以下を質問して、回答に基づきファイルを更新してください。

質問事項:
- プロジェクト名 (英語、kebab-case。例: "my-awesome-app")
- プロジェクトの簡単な説明 (日本語)
- 対応する Notion ページはありますか？ (URL があれば CLAUDE.md に記載)

更新対象:
- package.json の "name" フィールド
- README.md のタイトルと説明文
- CLAUDE.md の「WHY - プロジェクトの目的」セクション

## Step 2: データベース (デフォルト: Supabase ローカル)

以下を質問してください。

質問: Supabase ローカル開発環境を使いますか？ 別の構成にする場合はお知らせください。
  - a) Supabase ローカル (デフォルト・推奨)
  - b) ローカル PostgreSQL (Docker のみ、Supabase なし)
  - c) Neon / その他ホスティング
  - d) まだ決めていない (後で設定)

### a) Supabase ローカルの場合 (デフォルト):

依存関係の追加:
- pnpm add @supabase/supabase-js @supabase/ssr を実行

Supabase プロジェクト初期化:
- npx supabase init を実行 (supabase/ ディレクトリが生成される)
- supabase/config.toml を編集:
  - project_id をプロジェクト名に設定
  - [auth] site_url = "http://127.0.0.1:3000"
  - [auth.email] enable_confirmations = false (ローカル開発ではメール確認不要)

package.json にスクリプトを追加:
```json
"supabase:start": "npx supabase start",
"supabase:stop": "npx supabase stop",
"supabase:gen:types": "npx supabase gen types typescript --local > src/types/database.generated.ts"
```

prisma/schema.prisma に directUrl を追加:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

.env.example を以下に更新:
```
# Supabase ローカル開発 (pnpm supabase:start で表示される値に置き換え)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase start で表示される anon key>
SUPABASE_SERVICE_ROLE_KEY=<supabase start で表示される service_role key>

# Database (Supabase ローカル PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

環境変数スキーマを更新:
- src/shared/env/server-env.ts に DATABASE_URL, DIRECT_URL, SUPABASE_SERVICE_ROLE_KEY を追加
- src/shared/env/client-env.ts に NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY を追加

.mcp.json を作成 (Claude Code から DB を直接参照可能にする):
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
      ]
    }
  }
}
```
- .mcp.json は .gitignore に追加済み

### b) ローカル PostgreSQL の場合:
- docker-compose.yml を作成 (PostgreSQL コンテナ)
- .env.example の DATABASE_URL をそのまま使用
- .mcp.json に PostgreSQL MCP サーバーを追加 (ポートは docker-compose に合わせる)

### c) その他 / d) 後で設定:
- .env.example に接続文字列の形式をコメントで追記

## Step 3: 認証 (デフォルト: Supabase Auth)

以下を質問してください。

質問: Supabase Auth を使いますか？ 別の認証方式にする場合はお知らせください。
  - a) Supabase Auth (デフォルト・推奨)
  - b) NextAuth.js (Auth.js v5)
  - c) 認証は後で追加する (スキップ)

### a) Supabase Auth の場合 (デフォルト):

Step 2 で Supabase を選んでいない場合は、まず @supabase/supabase-js @supabase/ssr を追加。

Supabase クライアントを作成:

src/server/lib/supabase/client.ts (SSR 対応サーバークライアント):
```typescript
import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clientEnv } from "@/shared/env/client-env";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    }
  );
}
```

src/server/lib/supabase/admin.ts (サービスロールクライアント):
```typescript
import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { clientEnv } from "@/shared/env/client-env";
import { serverEnv } from "@/shared/env/server-env";

export function createServiceRoleClient() {
  return createSupabaseClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

認証ラッパーを作成:

src/server/handlers/with-auth.ts:
```typescript
import "server-only";

import { createClient } from "@/server/lib/supabase/client";
import { appError, type AppError } from "@/shared/errors";
import { err, ok, type Result } from "@/shared/result";

export type AuthContext = {
  userId: string;
};

export async function authenticate(): Promise<Result<AuthContext, AppError>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return err(appError.auth("認証が必要です"));
  }
  return ok({ userId: user.id });
}
```

middleware.ts をプロジェクトルートに作成 (セッション更新用):
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );
  await supabase.auth.getUser();
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

auth.users → public.users 同期用マイグレーションを作成:
- supabase/migrations/ に SQL ファイルを作成
- auth.users への INSERT/UPDATE/DELETE トリガーで public.users (Prisma 管理) と同期
- prisma/schema.prisma の User モデルの id を String (auth.users.id と一致) にする

### b) NextAuth.js の場合:
- pnpm add next-auth@beta @auth/prisma-adapter を実行
- 使用する OAuth プロバイダーを質問 (Google / GitHub / LINE / その他)
- src/server/lib/auth/ に認証設定ファイルを作成
- src/app/api/auth/[...nextauth]/route.ts を作成
- src/server/handlers/with-auth.ts に認証ラッパーを実装
- prisma/schema.prisma に User / Account / Session / VerificationToken モデルを追加
- .env.example に NEXTAUTH_SECRET, NEXTAUTH_URL, OAuth プロバイダーの環境変数を追加

### c) スキップの場合:
- 何もしない

## Step 4: デプロイ先

以下を質問してください。

質問: Vercel にデプロイしますか？
  - a) Vercel (デフォルト)
  - b) その他 / まだ決めていない

### Vercel の場合:
- .github/workflows/cd-vercel.yml の on: セクションのコメントを外して有効化
- .github/workflows/cd-db-migration.yml の on: セクションのコメントを外して有効化
- README.md の CD ワークフローの状態を「有効」に更新
- 以下の GitHub Secrets が必要なことを伝える:
  - VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID

### その他の場合:
- .github/workflows/cd-vercel.yml はそのまま残す (必要に応じて後で設定)

## Step 5: Sentry (エラー監視)

質問: Sentry をセットアップしますか？
  - a) はい
  - b) いいえ (スキップ)

### セットアップする場合:
- pnpm add @sentry/nextjs を実行
- npx @sentry/wizard@latest -i nextjs を実行してウィザードに従う
- .env.example に SENTRY_DSN, SENTRY_AUTH_TOKEN, NEXT_PUBLIC_SENTRY_DSN を追加
- src/shared/env/server-env.ts に SENTRY_DSN を追加
- 生成された sentry.*.config.ts, instrumentation.ts を確認
- next.config.ts に withSentryConfig ラッパーを追加

## Step 6: CI/CD オプション

以下を質問してください。

質問事項:
- Slack 通知は使いますか？ (GitHub Secrets に SLACK_WEBHOOK_URL を設定)
- Claude Code の GitHub Actions 連携は使いますか？ (CLAUDE_CODE_OAUTH_TOKEN を設定)

回答に応じて README.md の CI/CD ワークフローテーブルを更新してください。

## Step 7: 初期スキーマ

質問: 最初に作るテーブル/モデルはありますか？
  - ある場合: どんなモデルが必要か (例: User, Post, Comment など)
  - ない場合: スキップ

### モデルがある場合:
- prisma/schema.prisma にモデルを追加
  - テーブル名は複数形 snake_case (@@map で指定)
  - カラム名は snake_case (@map で指定)
  - id は cuid() をデフォルトで使用
  - createdAt / updatedAt を必ず含める
- Supabase Auth を使う場合、User モデルの id は auth.users.id と一致させる (String @id)
- pnpm run db:generate を実行
- 必要に応じて src/types/ に型定義を作成

## Step 8: 検証

全ての設定が完了したら、以下のコマンドを順番に実行して問題がないか確認:

```bash
pnpm install
pnpm run db:generate
pnpm run type-check
pnpm run lint
pnpm run test
pnpm run format:check
pnpm run knip
```

エラーがあれば修正してください。

## Step 9: 完了報告

セットアップの結果をサマリーとして出力してください:

- プロジェクト名
- Notion ページ (あれば)
- DB: Supabase ローカル / PostgreSQL / その他
- 認証: Supabase Auth / NextAuth.js / なし
- デプロイ先: Vercel / その他 / 未定
- Sentry: 有効 / 無効
- 有効化した CI/CD ワークフロー
- 作成した初期モデル
- 次にやること:
  - pnpm supabase:start でローカル Supabase 起動
  - 表示された credentials を .env.local に反映
  - pnpm db:push でスキーマ反映
  - pnpm dev で開発サーバー起動
  - GitHub Secrets の設定 (必要な場合)
````

</details>

## 認証のセットアップ

> Agent による自動セットアップを使った場合、このセクションの内容は実施済みです。

このテンプレートには認証機能は含まれていない。プロジェクトの要件に応じて以下のいずれかを導入する:

### Supabase Auth

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

1. `src/server/lib/supabase/` に SSR 対応クライアント・サービスロールクライアントを作成
2. `src/server/handlers/with-auth.ts` に認証ラッパーを実装
3. `middleware.ts` でセッション更新を設定
4. `supabase/migrations/` に auth.users → public.users 同期トリガーを作成
5. `.env.local` に以下を追加:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### NextAuth.js

```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

1. `src/server/lib/auth/` に認証設定を配置
2. `src/app/api/auth/[...nextauth]/route.ts` を作成
3. `src/server/handlers/with-auth.ts` に認証ラッパーを実装
4. `.env.local` に以下を追加:
   - `NEXTAUTH_SECRET` (openssl rand -base64 32 で生成)
   - `NEXTAUTH_URL`
   - OAuth プロバイダーの Client ID / Secret

### 認証導入時の注意

- `src/server/handlers/` 配下のファイルは `require-with-auth` ESLint ルールにより `withAuth` でのラップが求められる
- 認証不要なエンドポイントは eslint.config.mjs の `require-with-auth` セクションの `ignores` に追加する

## ディレクトリ構成

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 認証必須ページ
│   ├── (public)/                 # 公開ページ
│   └── api/                      # API Routes
│       ├── auth/                 # 認証 API
│       └── integrations/         # 外部連携 API
├── client/                       # クライアント専用コード
│   ├── components/
│   │   ├── features/             # 機能別コンポーネント
│   │   └── ui/                   # 汎用 UI コンポーネント
│   └── hooks/                    # カスタムフック
├── server/                       # サーバー専用コード (server-only)
│   ├── db/                       # DB クライアント・シード
│   ├── handlers/                 # エントリポイント
│   │   ├── actions/              # Server Actions
│   │   └── api/                  # API Route ハンドラー
│   ├── lib/                      # サーバーユーティリティ
│   │   ├── auth/                 # 認証ロジック
│   │   └── adapters/             # 外部サービスアダプター
│   ├── repositories/             # データアクセス層
│   └── usecases/                 # ビジネスロジック層
├── shared/                       # クライアント・サーバー共有コード
│   ├── env/                      # 環境変数
│   ├── logger/                   # ロガー
│   ├── result.ts                 # Result 型
│   └── utils/                    # ユーティリティ
├── types/                        # 型定義
└── test/                         # テストユーティリティ
```

### レイヤー間の依存ルール

```
app/ ──→ server/handlers/ ──→ server/usecases/ ──→ server/repositories/
                                                 ──→ server/lib/
```

- `app/` から `server/` を直接 import できない（`server/handlers/*` のみ許可）
- `server/handlers/` から `server/repositories/` や `server/lib/` を直接 import できない（`server/usecases/` 経由）
- レイヤー間の相対 import (`../`) は禁止（`@/` エイリアスを使用）

## npm scripts

| コマンド            | 説明                      |
| ------------------- | ------------------------- |
| `pnpm dev`          | 開発サーバー起動          |
| `pnpm build`        | 本番ビルド                |
| `pnpm lint`         | ESLint チェック           |
| `pnpm lint:fix`     | ESLint 自動修正           |
| `pnpm format`       | Prettier フォーマット     |
| `pnpm format:check` | Prettier チェック         |
| `pnpm type-check`   | TypeScript 型チェック     |
| `pnpm test`         | テスト実行                |
| `pnpm knip`         | 不要コード検出            |
| `pnpm db:push`      | DB スキーマ反映（開発用） |
| `pnpm db:generate`  | Prisma Client 生成        |
| `pnpm db:studio`    | Prisma Studio 起動        |

## CI/CD ワークフロー

| ファイル                 | 説明                       | 状態                   |
| ------------------------ | -------------------------- | ---------------------- |
| `ci.yml`                 | リント・テスト・ビルド検証 | 有効                   |
| `cd-vercel.yml`          | Vercel デプロイ            | 無効（要セットアップ） |
| `cd-db-migration.yml`    | Prisma マイグレーション    | 無効（要セットアップ） |
| `slack-notification.yml` | Slack 通知（リユーザブル） | 有効                   |
| `claude.yml`             | Claude Code アシスタント   | 有効                   |
| `learn-from-review.yml`  | レビュー学習               | 有効                   |
| `weekly-audit.yml`       | 週次監査                   | 有効                   |

### CD ワークフローの有効化

1. **cd-vercel.yml**: Vercel プロジェクトを作成し、GitHub Secrets を設定後、ファイル内の `on:` セクションのコメントを外す
2. **cd-db-migration.yml**: PostgreSQL をセットアップし、`DATABASE_URL` を Secrets に設定後、ファイル内の `on:` セクションのコメントを外す

## カスタム ESLint ルール

18 個のカスタム ESLint ルールでアーキテクチャを強制:

| ルール                              | 説明                                             |
| ----------------------------------- | ------------------------------------------------ |
| `require-server-only`               | `src/server/` に `server-only` import を必須化   |
| `no-direct-layer-import`            | レイヤーアーキテクチャ違反の検出                 |
| `no-direct-server-import`           | `server/handlers/*` 以外の直接 import を禁止     |
| `require-with-auth`                 | ハンドラーに認証ラッパーを必須化                 |
| `require-result-return-type`        | usecases/handlers に Result 戻り値を必須化       |
| `no-throw-statement`                | サーバーコードで throw を禁止                    |
| `enforce-error-handling-pattern`    | try-catch でのエラー伝播を強制                   |
| `no-dynamic-env-access`             | `process.env[var]` を禁止                        |
| `no-browser-notifications`          | `alert`/`confirm`/`prompt` を禁止                |
| `no-pino-object-in-second-arg`      | Pino ロガーの引数順序を強制                      |
| `max-api-route-handler-lines`       | API Route を 80 行以下に制限                     |
| `max-params-with-object`            | 3 引数以上はオブジェクト化を推奨                 |
| `no-top-level-await-in-actions`     | Server Actions のトップレベル await を禁止       |
| `no-relative-imports-across-layers` | レイヤー間の相対 import を禁止                   |
| `enforce-naming-convention`         | ファイル名規約 (.tsx=PascalCase, .ts=kebab-case) |
| `jsdoc-format-japanese`             | 日本語 JSDoc フォーマット                        |
| `no-magic-strings-in-sql`           | SQL 内マジックストリングを禁止                   |
