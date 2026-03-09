# require-result-return-type

`src/server/usecases/` と `src/server/handlers/` のエクスポート関数に Result 型の戻り値を強制する ESLint ルール。

## ルールの詳細

ビジネスロジック層では必ず Result 型を返すことで、エラーハンドリングを型安全に行う。

### ❌ エラー (Result 型でない)

```typescript
// src/server/usecases/user.ts
export const getUser = async (id: string): Promise<User | null> => {
  // null でエラーを表現 → 型が曖昧
  const user = await userRepository.findById(id);
  return user;
};
```

### ✅ OK (Result 型を返す)

```typescript
// src/server/usecases/user.ts
import { ok, err, type Result } from "@/shared/result";

export const getUser = async (id: string): Promise<Result<User, Error>> => {
  const user = await userRepository.findById(id);

  if (!user) {
    return err(new Error("User not found"));
  }

  return ok(user);
};
```

## 対象ディレクトリ

- `src/server/usecases/`
- `src/server/handlers/`

## 検出パターン

### エクスポート関数

```typescript
// ❌ NG
export function getUser(id: string): Promise<User> { ... }

// ✅ OK
export function getUser(id: string): Promise<Result<User, Error>> { ... }
```

### エクスポート変数 (アロー関数)

```typescript
// ❌ NG
export const getUser = async (id: string): Promise<User> => { ... };

// ✅ OK
export const getUser = async (id: string): Promise<Result<User, Error>> => { ... };
```

### オブジェクトメソッド

```typescript
// ❌ NG
export const userUsecase = {
  get: async (id: string): Promise<User> => { ... },
};

// ✅ OK
export const userUsecase = {
  get: async (id: string): Promise<Result<User, Error>> => { ... },
};
```

## Result 型の構造

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

### 使用例

```typescript
const result = await getUser("123");

if (result.ok) {
  console.log(result.value); // User 型
} else {
  console.error(result.error); // Error 型
}
```

## メリット

1. **型安全**: エラーが型で表現される
2. **明示的**: 関数がエラーを返す可能性が明確
3. **網羅性**: TypeScript が未処理エラーを検出
4. **一貫性**: プロジェクト全体でエラーハンドリングが統一される

## 要件

このルールは型情報を使用するため、`parserOptions.project` の設定が必要。

```javascript
// eslint.config.mjs
{
  languageOptions: {
    parserOptions: {
      project: "./tsconfig.json",
    },
  },
}
```

## 関連ルール

- [no-throw-statement](../no-throw-statement/) - throw の禁止
- [enforce-error-handling-pattern](../enforce-error-handling-pattern/) - try-catch のパターン強制
