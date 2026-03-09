# no-magic-strings-in-sql

SQL/ORM クエリ内でマジックストリングの使用を禁止する ESLint ルール。

## ルールの詳細

SQL クエリ内の文字列リテラルは typo やデータ不整合の原因となるため、定数や型付き変数を使用する。

### ❌ エラー (マジックストリング)

```typescript
import { users } from "@/server/db/schema";

const activeUsers = await db.select().from(users).where(eq(users.status, "active"));
// "active" がハードコード → typo のリスク
```

### ✅ OK (定数を使用)

```typescript
import { users } from "@/server/db/schema";

const USER_STATUS_ACTIVE = "active" as const;

const activeUsers = await db.select().from(users).where(eq(users.status, USER_STATUS_ACTIVE));
// 定数で型安全
```

### ✅ OK (型付き変数)

```typescript
type UserStatus = "active" | "inactive" | "suspended";

const status: UserStatus = "active";

const users = await db.select().from(users).where(eq(users.status, status));
// 型で値が制限される
```

## 対象となる関数

- `eq` (等価比較)
- `ne` (不等価比較)
- `gt`, `gte`, `lt`, `lte` (大小比較)
- `like`, `ilike`, `notLike`, `notIlike` (パターンマッチ)
- `inArray`, `notInArray` (配列検索)

## 例外パターン

以下のパターンは許可される:

### メールアドレス

```typescript
const user = await db.select().from(users).where(eq(users.email, "user@example.com"));
// メールアドレスは一意なのでOK
```

### UUID

```typescript
const record = await db
  .select()
  .from(records)
  .where(eq(records.id, "550e8400-e29b-41d4-a716-446655440000"));
// UUIDは一意なのでOK
```

## 推奨パターン

### Enum 型の使用

```typescript
// src/types/user.ts
export const USER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];

// クエリ
const activeUsers = await db.select().from(users).where(eq(users.status, USER_STATUSES.ACTIVE));
```

### Union 型の使用

```typescript
type Role = "admin" | "user" | "guest";

const role: Role = "admin";
const admins = await db.select().from(users).where(eq(users.role, role));
```

## メリット

1. **Typo 防止**: 定数名の typo はコンパイルエラーになる
2. **リファクタリング**: 値の変更が一箇所で済む
3. **型安全**: 許可される値が型で制限される
4. **可読性**: 定数名で意味が明確になる

## レベル設定

このルールは `warn` レベルで設定されている。

```javascript
// eslint.config.mjs
rules: {
  "custom/no-magic-strings-in-sql": "warn",
}
```
