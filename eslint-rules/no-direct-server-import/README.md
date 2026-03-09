# no-direct-server-import

`src/server/` 外から `@/server/*` への直接 import を制限し、`@/server/handlers/*` 経由のアクセスのみを許可する ESLint ルール。

## ルールの詳細

サーバーコードへのアクセスを `handlers` に限定し、サーバー内部実装の詳細を隠蔽する。

### ❌ エラー (サーバー内部への直接 import)

```typescript
// src/app/page.tsx
import { db } from "@/server/db";
// db への直接 import → エラー

// src/client/hooks/use-user.ts
import { userRepository } from "@/server/repositories/user";
// repository への直接 import → エラー

// src/shared/utils/auth.ts
import { getUserUsecase } from "@/server/usecases/user";
// usecase への直接 import → エラー
```

### ✅ OK (handlers 経由)

```typescript
// src/app/page.tsx
import { getUser } from "@/server/handlers/actions/user";
// handlers 経由は OK

// src/client/hooks/use-user.ts
import { getUserAction } from "@/server/handlers/actions/user";
// handlers/actions は OK
```

## アクセス制御ルール

| Import 元       | `@/server/handlers/*` | `@/server/*` (その他) |
| --------------- | --------------------- | --------------------- |
| `src/server/**` | ✅ OK                 | ✅ OK                 |
| `src/app/**`    | ✅ OK                 | ❌ NG                 |
| `src/client/**` | ✅ OK                 | ❌ NG                 |
| `src/shared/**` | ✅ OK                 | ❌ NG                 |
| `src/types/**`  | ✅ OK                 | ❌ NG                 |
| `middleware.ts` | ✅ OK                 | ❌ NG (例外あり)      |

## 例外

以下のファイルは内部 import を許可:

- `src/middleware.ts` - Edge Runtime 互換性のため一部許可
- `src/server/` 配下の全ファイル - サーバー内部なので制限なし

## メリット

1. **カプセル化**: サーバー内部実装が外部に露出しない
2. **変更容易性**: handlers の interface を保てば内部は自由に変更可能
3. **セキュリティ**: 意図しない DB アクセスや機密情報の漏洩を防ぐ
4. **明確な API 境界**: handlers が公開 API として機能

## アーキテクチャ

```
外部 (app/client/shared)
  ↓
  @/server/handlers/*  ← 公開 API (唯一のエントリポイント)
  ↓
  @/server/usecases/*  ← 内部実装 (非公開)
  ↓
  @/server/repositories/* ← 内部実装 (非公開)
  @/server/lib/*          ← 内部実装 (非公開)
  @/server/db/*           ← 内部実装 (非公開)
```

## 型定義の共有

DB スキーマ型など外部で必要な型は `src/types/` に分離する。

```typescript
// ❌ 悪い例
import type { User } from "@/server/db/schema/users";
// schema への直接 import → エラー

// ✅ 良い例
import type { User } from "@/types/user";
// types 経由で公開された型を使用
```

## 関連ルール

- [require-server-only](../require-server-only/) - サーバーコードの保護
- [no-direct-layer-import](../no-direct-layer-import/) - レイヤー境界の強制
