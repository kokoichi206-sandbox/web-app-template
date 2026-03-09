# require-server-only

`src/server/` ディレクトリ配下のファイルに `'server-only'` import を強制する ESLint ルール。

## ルールの詳細

サーバー専用コードがクライアントバンドルに含まれるのを防ぐ。

### ❌ エラー (server-only が未 import)

```typescript
// src/server/usecases/user.ts
import { db } from "@/server/db";

export const getUser = async (id: string) => {
  // server-only が無い → クライアントに含まれる可能性
  return await db.query.users.findFirst({ where: eq(users.id, id) });
};
```

### ✅ OK (server-only を import)

```typescript
// src/server/usecases/user.ts
import "server-only";

import { db } from "@/server/db";

export const getUser = async (id: string) => {
  return await db.query.users.findFirst({ where: eq(users.id, id) });
};
```

## 自動修正

このルールは自動修正をサポートしている。

```typescript
// Before (自動修正前)
import { db } from "@/server/db";

// After (自動修正後)
import "server-only";

import { db } from "@/server/db";
```

## 例外

以下のファイルは `server-only` が不要:

- `"use server"` ディレクティブがあるファイル (Server Actions)
- `src/server/db/schema/` 配下 (Prisma スキーマ互換性)
- `auth.config.ts` (Edge Runtime 対応)
- テストファイル (`*.test.ts`)

## メリット

1. **セキュリティ**: サーバー専用コードのクライアント流出を防ぐ
2. **バンドルサイズ削減**: サーバーコードがクライアントバンドルに含まれない
3. **早期エラー検出**: ビルド時に誤った import を検出
4. **明示的な境界**: サーバー/クライアント境界が明確になる

## 仕組み

`server-only` パッケージは、クライアント環境でインポートされるとビルドエラーを発生させる。

## 関連ルール

- [no-direct-server-import](../no-direct-server-import/) - サーバーコードへの直接 import を制限
- Next.js 公式: [server-only package](https://nextjs.org/docs/getting-started/react-essentials#the-server-only-package)
