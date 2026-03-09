# require-with-auth

`src/server/handlers/` 配下のエクスポート関数に `withAuth` または `withOptionalAuth` ラッパーを強制する ESLint ルール。

## ルールの詳細

全ての handler は認証チェックを経由することを保証し、認証漏れを防ぐ。

### ❌ エラー (認証ラッパーなし)

```typescript
// src/server/handlers/actions/user.ts
export const deleteUser = async (id: string) => {
  // withAuth がない → 誰でも削除できてしまう
  return await deleteUserUsecase(id);
};
```

### ✅ OK (withAuth でラップ)

```typescript
// src/server/handlers/actions/user.ts
import { withAuth } from "@/server/handlers/with-auth";

const _deleteUser = async (id: string, session: Session) => {
  return await deleteUserUsecase(id, session.user.id);
};

export const deleteUser = withAuth(_deleteUser);
// withAuth でラップ → 認証必須
```

## ラッパーの種類

### withAuth (認証必須)

```typescript
import { withAuth } from "@/server/handlers/with-auth";

const _getMyProfile = async (session: Session) => {
  return await getUserUsecase(session.user.id);
};

export const getMyProfile = withAuth(_getMyProfile);
// ログインしていない場合はエラー
```

### withOptionalAuth (認証オプション)

```typescript
import { withOptionalAuth } from "@/server/handlers/with-auth";

const _getPublicContent = async (session: Session | null) => {
  // session が null の場合もある
  const userId = session?.user.id;
  return await getContentUsecase(userId);
};

export const getPublicContent = withOptionalAuth(_getPublicContent);
// ログインしていなくても OK
```

## パターン

### 推奨パターン

```typescript
// 1. 内部関数を定義 (プレフィックス _ を付ける)
const _myAction = async (arg: string, session: Session) => {
  return await myUsecase(arg, session.user.id);
};

// 2. withAuth でラップしてエクスポート
export const myAction = withAuth(_myAction);
```

### 型定義のエクスポート

```typescript
// 型定義は大文字で始まるためチェック対象外
export type MyActionInput = {
  name: string;
};
```

## 例外

以下のファイルは例外:

- `src/server/handlers/api/auth.ts` - 認証の根幹のため
- `src/server/handlers/api/yahoo-accounts.ts` - トークン受け渡し用内部 API
- `src/server/handlers/api/extension.ts` - Chrome 拡張機能配布用公開エンドポイント

## メリット

1. **セキュリティ**: 認証漏れを防ぐ
2. **一貫性**: 全 handler で認証処理が統一される
3. **型安全**: Session 型が自動的に注入される
4. **保守性**: 認証ロジックの変更が一箇所で済む

## 認証フロー

```
Client Request
  ↓
Handler (withAuth)
  ↓
認証チェック
  ↓ OK
Usecase (session 付き)
  ↓
Response
```

## 関連ルール

- [no-direct-layer-import](../no-direct-layer-import/) - handler の責務を明確化
