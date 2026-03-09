---
globs:
  - src/server/handlers/actions/**
  - src/server/usecases/**
  - src/server/repositories/**
  - src/app/api/**
---

# サーバーサイド境界ルール

## レイヤー分離とアクセス制御

**依存方向:**

```
app → handlers → usecases → repositories → db
                      ↓
              lib/adapters/
```

**アクセス制御ルール:**

1. **src/server/ の外からは handlers/ のみアクセス可能**（ESLint ルール `no-direct-server-import`）
2. **app/ と handlers/actions/ は usecases を経由する**（ESLint ルール `no-direct-layer-import`）
3. **handlers/ は必ず withAuth でラップする**（ESLint ルール `require-with-auth`）
4. **usecases と handlers は Result 型を返す**（ESLint ルール `require-result-return-type`）
5. **サーバーコードでは throw を使わない**（ESLint ルール `no-throw-statement`）

**レイヤー間の責務:**

- **handlers/**: 認証・リクエストコンテキスト管理、usecases の呼び出し
- **usecases/**: ビジネスロジック、複数 Repository の組み合わせ、外部 API 連携
- **repositories/**: DB CRUD 操作のみ
- **lib/adapters/**: 外部 API のラッパー（認証、エラーハンドリング）

## Server Actions の標準実装パターン

Server Actions は必ず withAuth / withOptionalAuth でラップする（ESLint ルール `require-with-auth` で強制）。

**基本パターン:**

```typescript
"use server";

import { withAuth } from "@/server/handlers/with-auth";
import { itemsUsecase } from "@/server/usecases/items-usecase";
import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/result";
import type { Item } from "@/types/item";

/**
 * アイテム一覧を取得する（内部実装）
 *
 * - withAuth でラップする前の関数は _ プレフィックスを付ける
 * - 第一引数は必ず userId（withAuth が自動注入）
 */
const _getItems = async (userId: string): Promise<Result<Item[], AppError>> => {
  return itemsUsecase.list(userId);
};

/**
 * アイテム一覧を取得する（公開 Server Action）
 */
export const getItemsAction = withAuth(_getItems);

/**
 * アイテムを作成する（引数あり）
 */
const _createItem = async (
  userId: string,
  body: { name: string; description: string }
): Promise<Result<Item, AppError>> => {
  return itemsUsecase.create(userId, body);
};

export const createItemAction = withAuth(_createItem);
```

**withOptionalAuth の使用例:**

```typescript
/**
 * 未認証ユーザーにも公開するデータを取得する
 */
const _getPublicItems = async (userId: string | undefined): Promise<Result<Item[], AppError>> => {
  if (!userId) {
    return ok([]); // 未認証の場合は空配列
  }
  return itemsUsecase.list(userId);
};

export const getPublicItemsAction = withOptionalAuth(_getPublicItems);
```

**withAuth が提供する機能:**

- リクエストコンテキストの自動設定（runWithRequestContextFromHeaders）
- セッションチェック（未認証なら unauthorized エラー）
- ログに userId を自動付与（setUserId）
- エラーの統一的なログ出力（ユーザー起因は warn、サーバー起因は error）

**参照:** `src/server/handlers/with-auth.ts`, `src/server/handlers/actions/reports.ts`

## API Route の使用制限

API Route は必要最小限にする。以下の場合のみ使用：

- OAuth コールバック（外部サービスからのリダイレクト）
- Webhook（外部サービスからのPOST）
- ファイルダウンロード（HTTP仕様が必要な場合）
- NextAuth 標準ルート `/api/auth/[...nextauth]`

それ以外は Server Actions を使用する。

## サーバー専用パッケージの扱い

Node.js 専用パッケージ（`node:*`, `uuid`, `bcrypt` など）や Next.js サーバー API（`next/headers` など）は dynamic import で遅延ロード。

```typescript
// ✅ Good: Dynamic import で遅延ロード
export async function runWithRequestContextFromHeaders<T>(fn: () => T | Promise<T>): Promise<T> {
  const { headers } = await import("next/headers"); // サーバー専用
  const { v7: uuidv7 } = await import("uuid"); // Node.js 専用
  // ...
}

// ❌ Bad: Top-level import
import { v7 as uuidv7 } from "uuid"; // クライアントバンドルに含まれてエラー
```

**IMPORTANT:** `shared/` 配下は特に注意（クライアントから参照される可能性）。
