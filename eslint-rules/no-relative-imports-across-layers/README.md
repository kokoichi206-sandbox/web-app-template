# no-relative-imports-across-layers

アーキテクチャレイヤーをまたぐ相対インポート (`../`) を禁止し、絶対インポート (`@/*`) の使用を強制する ESLint ルール。

## ルールの詳細

レイヤー間の依存関係を明示的にするため、相対パスではなく絶対パスを使用する。

### ❌ エラー (相対パスでレイヤー横断)

```typescript
// src/app/users/page.tsx
import { getUserUsecase } from "../../../server/usecases/user";
// ../../../ でレイヤーを横断 → エラー
```

### ✅ OK (絶対パス)

```typescript
// src/app/users/page.tsx
import { getUser } from "@/server/handlers/actions/user";
// @ エイリアスで絶対パス → OK
```

## レイヤー定義

| レイヤー | 説明                         |
| -------- | ---------------------------- |
| `app`    | Next.js App Router (ページ)  |
| `client` | クライアント専用 (hooks, UI) |
| `server` | サーバー専用 (API, DB)       |
| `shared` | 共通ロジック                 |
| `types`  | 型定義                       |

## 禁止パターン

### パターン1: app → server

```typescript
// ❌ src/app/page.tsx
import { db } from "../../../server/db";

// ✅ 正しい方法
import { getData } from "@/server/handlers/actions/data";
```

### パターン2: client → server

```typescript
// ❌ src/client/hooks/use-user.ts
import { userRepository } from "../../server/repositories/user";

// ✅ 正しい方法
import { getUser } from "@/server/handlers/actions/user";
```

### パターン3: app ↔ client

```typescript
// ❌ src/app/layout.tsx
import { MyButton } from "../../client/components/MyButton";

// ✅ 正しい方法
import { MyButton } from "@/client/components/MyButton";
```

## 許可パターン

### 同一レイヤー内の相対パス

```typescript
// ✅ src/app/users/edit/page.tsx
import { UserForm } from "../components/UserForm";
// 同じ app レイヤー内 → OK
```

### shared / types への相対パス

```typescript
// ✅ src/app/page.tsx
import { formatDate } from "../../../shared/utils/date";
// shared は全レイヤーから参照可能 → OK
```

## レイヤー横断判定

以下の条件で「レイヤー横断」と判定:

1. `../` で上位ディレクトリに移動している
2. インポート先が異なるレイヤー
3. インポート先が `shared` / `types` 以外

## メリット

1. **可読性**: インポート元が明確になる
2. **リファクタリング**: ファイル移動時にパスが壊れにくい
3. **依存関係の可視化**: レイヤー間の依存が明示的
4. **一貫性**: プロジェクト全体でインポートパターンが統一される

## 設定

絶対パスは `tsconfig.json` で設定:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## パス比較

| パターン                         | 可読性 | 移動耐性 | 推奨 |
| -------------------------------- | ------ | -------- | ---- |
| `../../../server/usecases/user`  | ❌     | ❌       | ❌   |
| `@/server/usecases/user`         | ⚠️     | ✅       | ⚠️   |
| `@/server/handlers/actions/user` | ✅     | ✅       | ✅   |

## 関連ルール

- [no-restricted-imports](https://eslint.org/docs/latest/rules/no-restricted-imports) - `../` パターンの禁止
- [no-direct-server-import](../no-direct-server-import/) - サーバーへのアクセス制限
- [no-direct-layer-import](../no-direct-layer-import/) - レイヤーアーキテクチャ強制
