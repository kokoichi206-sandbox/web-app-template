# no-dynamic-env-access

`process.env` への動的アクセス (ブラケット記法) を禁止する ESLint ルール。

## ルールの詳細

動的な環境変数アクセスは型チェックをバイパスし、ランタイムエラーの原因となるため禁止する。

### ❌ エラー (動的アクセス)

```typescript
const key = "DATABASE_URL";
const url = process.env[key];
// 変数でアクセス → 型チェックされない

const envVar = process.env[getEnvKey()];
// 関数の戻り値でアクセス → 型安全でない
```

### ✅ OK (静的アクセス via serverEnv)

```typescript
import { serverEnv } from "@/shared/env/server-env";

const url = serverEnv.DATABASE_URL;
// 型安全かつ Zod でバリデーション済み
```

## 推奨パターン

### 環境変数の読み込み

```typescript
// ❌ 悪い例
const dbUrl = process.env.DATABASE_URL;
// 1. 型チェックされない
// 2. バリデーションされない
// 3. undefined の可能性

// ✅ 良い例
import { serverEnv } from "@/shared/env/server-env";
const dbUrl = serverEnv.DATABASE_URL;
// 1. 型が保証される (string)
// 2. Zod でバリデーション済み
// 3. 起動時に未定義ならエラー
```

### 環境変数の定義

```typescript
// src/shared/env/server-env.ts
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  API_KEY: z.string().min(1),
});

export const serverEnv = schema.parse(process.env);
```

## なぜ動的アクセスが危険か

### 問題1: 型安全性の欠如

```typescript
const key = "DATABASE_URL";
const value = process.env[key]; // 型: string | undefined
// typo しても気づかない
```

### 問題2: バリデーション不可

```typescript
const vars = ["DB_URL", "API_KEY", "SECRET"];
vars.forEach((key) => {
  const value = process.env[key];
  // どの変数が必須か、Zod で検証できない
});
```

### 問題3: 静的解析不可

```typescript
function getEnv(key: string) {
  return process.env[key];
}
// 何の環境変数が使われているか追跡不可
```

## メリット

1. **型安全**: 環境変数の型が保証される
2. **早期エラー検出**: 起動時にバリデーションエラーが検出される
3. **補完**: IDE で環境変数名の補完が効く
4. **追跡可能**: どの環境変数が使われているか明確

## 環境変数の種類

| ファイル                       | 用途                     |
| ------------------------------ | ------------------------ |
| `src/shared/env/server-env.ts` | サーバー専用環境変数     |
| `src/shared/env/edge-env.ts`   | Edge Runtime 用環境変数  |
| `src/shared/env/public-env.ts` | クライアント公開環境変数 |

## 例外

以下のファイルでは `process.env` の直接アクセスを許可:

- `src/shared/env/**/*.ts` - 環境変数定義ファイル
- `prisma/schema.prisma` - Prisma 設定
- `next.config.ts` - Next.js 設定
- `src/server/lib/auth/auth.config.ts` - Edge Runtime 用

## 関連ルール

- [no-process-env](https://eslint.org/docs/latest/rules/no-process-env) - process.env の使用を制限
