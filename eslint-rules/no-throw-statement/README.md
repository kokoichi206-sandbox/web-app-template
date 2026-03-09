# no-throw-statement

サーバーコードでの `throw` 文の使用を禁止し、Result 型によるエラーハンドリングを強制する ESLint ルール。

## ルールの詳細

例外の `throw` は制御フローを不明瞭にし、型安全性を損なうため、明示的な Result 型を使用する。

### ❌ エラー (throw を使用)

```typescript
// src/server/usecases/user.ts
export const getUser = async (id: string) => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw new Error("User not found");
    // throw は禁止 → エラー
  }

  return user;
};
```

### ✅ OK (Result 型を使用)

```typescript
// src/server/usecases/user.ts
import { ok, err, type Result } from "@/shared/result";

export const getUser = async (id: string): Promise<Result<User, Error>> => {
  const user = await userRepository.findById(id);

  if (!user) {
    return err(new Error("User not found"));
    // Result.err でエラーを返す
  }

  return ok(user);
};
```

## Result 型の使い方

### 成功ケース

```typescript
import { ok } from "@/shared/result";

const result = await getUser("123");
if (result.ok) {
  console.log(result.value); // User オブジェクト
}
```

### エラーケース

```typescript
import { err } from "@/shared/result";

const result = await getUser("invalid");
if (!result.ok) {
  console.error(result.error); // Error オブジェクト
}
```

## メリット

1. **型安全**: エラーが型システムで表現される
2. **明示的**: 関数がエラーを返す可能性が型から分かる
3. **制御フロー**: エラーハンドリングが予測可能
4. **網羅性チェック**: TypeScript がエラー処理の漏れを検出

## パターン比較

### ❌ throw パターン (非推奨)

```typescript
// 呼び出し側で try-catch が必要
try {
  const user = await getUser("123");
  // user の型: User (エラーの可能性が型に現れない)
} catch (error) {
  // どんなエラーが起きるか型から分からない
  console.error(error);
}
```

### ✅ Result パターン (推奨)

```typescript
// 型で成功/失敗を表現
const result = await getUser("123");
// result の型: Result<User, Error>

if (result.ok) {
  const user = result.value; // User 型
} else {
  const error = result.error; // Error 型
}
```

## 例外的な throw の許可

このルールは `src/server/` 配下のみに適用される。テストコードやクライアントコードでは制限されない。

## 関連ルール

- [require-result-return-type](../require-result-return-type/) - Result 型の戻り値を強制
- [enforce-error-handling-pattern](../enforce-error-handling-pattern/) - try-catch のパターン強制
