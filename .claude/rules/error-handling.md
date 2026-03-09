---
globs:
  - src/server/**
  - src/shared/errors.ts
  - src/shared/result.ts
---

# エラーハンドリング規約

## Result 型による統一的なエラーハンドリング

サーバーコードでは throw を使わず、Result 型で統一的にエラーを扱う（ESLint ルール `no-throw-statement` で強制）。

## Result 型の基本

```typescript
import { ok, err, okVoid, type Result } from "@/shared/result";
import { appError, type AppError } from "@/shared/errors";

// 成功時
const successResult: Result<User, AppError> = ok(user);

// 失敗時
const errorResult: Result<User, AppError> = err(appError.notFound("ユーザーが見つかりません"));

// void を返す成功
const voidResult: Result<void, AppError> = okVoid();
```

## パターン1: try-catch を safeTry で置き換える

```typescript
// ❌ Bad: throw を使う
async function getUser(id: string): Promise<User> {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) throw new Error("User not found");
  return user;
}

// ✅ Good: Result型を使う
async function getUser(id: string): Promise<Result<User, AppError>> {
  const result = await safeTry(() => db.query.users.findFirst({ where: eq(users.id, id) }));

  if (!result.ok) {
    return err(appError.db("ユーザー取得に失敗しました", result.error));
  }

  if (!result.value) {
    return err(appError.notFound("ユーザーが見つかりません"));
  }

  return ok(result.value);
}
```

## パターン2: 複数の Result 型を扱う

```typescript
async function createReport(userId: string): Promise<Result<Report, AppError>> {
  // 1. ユーザーを取得
  const userResult = await userRepository.findById(userId);
  if (!userResult.ok) return err(userResult.error); // Early return

  // 2. レポートを作成
  const reportResult = await reportRepository.create(userResult.value);
  if (!reportResult.ok) return err(reportResult.error);

  return ok(reportResult.value);
}
```

## AppError の型定義

```typescript
export type AppError =
  | { type: "unauthorized"; message: string }
  | { type: "db_error"; message: string; cause?: unknown }
  | { type: "api_error"; message: string; status?: number; cause?: unknown }
  | { type: "validation_error"; message: string; details?: unknown }
  | { type: "config_error"; message: string }
  | { type: "not_found"; message: string }
  | { type: "forbidden"; message: string };

// エラー生成
const error = appError.db("Message", originalError);
const error = appError.api("Not Found", 404, cause);
const error = appError.validation("Invalid input");
const error = appError.notFound("Resource not found");
```

## エラーのログ出力

withAuth で自動的にログ出力されるため、handlers では logError 呼び出し不要。

- **ユーザー起因**（unauthorized, validation_error, not_found, forbidden）は `warn`
- **サーバー起因**（db_error, api_error, config_error）は `error`

```typescript
const USER_ERROR_TYPES: Set<AppError["type"]> = new Set([
  "unauthorized",
  "validation_error",
  "not_found",
  "forbidden",
]);

const isUserError = (error: AppError): boolean => {
  return USER_ERROR_TYPES.has(error.type);
};

const logError = (error: AppError): void => {
  const extra = getExtraAsObject();
  if (isUserError(error)) {
    logger.warn({ err: error, ...extra }, `Request failed: ${error.type}`);
  } else {
    logger.error({ err: error, ...extra }, `Request failed: ${error.type}`);
  }
};
```

## ユーザー向けメッセージの設計

トースト、エラーメッセージ、通知など、ユーザー向けメッセージには内部実装の詳細（job ID、UUID、ハッシュ値など）を含めない。

```typescript
// ❌ Bad: 技術的な詳細を含む
toast.error(`ジョブ ${jobId} の実行に失敗しました`);

// ✅ Good: ユーザーが理解できる言葉
toast.error("レポート生成に失敗しました。もう一度お試しください。");
```

ユーザーが理解できる言葉で、次のアクションを明示する。技術的な詳細はログに記録。

**参照:** `src/shared/result.ts`, `src/shared/errors.ts`, `src/server/handlers/with-auth.ts`
