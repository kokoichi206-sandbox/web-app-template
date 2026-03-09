# no-direct-layer-import

レイヤーアーキテクチャの境界を強制し、`app/` や `actions/` から `repositories/` や `lib/` への直接 import を禁止する ESLint ルール。

## ルールの詳細

クリーンアーキテクチャに従い、上位レイヤーは `usecases` を経由して下位レイヤーにアクセスする。

### ❌ エラー (直接 import)

```typescript
// src/app/users/page.tsx
import { userRepository } from "@/server/repositories/user";
// repositories への直接 import → エラー

// src/server/handlers/actions/user.ts
import { sendEmail } from "@/server/lib/email";
// lib への直接 import → エラー
```

### ✅ OK (usecases 経由)

```typescript
// src/app/users/page.tsx
import { getUserList } from "@/server/handlers/actions/user";
// handlers/actions 経由で usecase を呼ぶ

// src/server/handlers/actions/user.ts
import { getUserListUsecase } from "@/server/usecases/user";
// usecase 経由でアクセス
```

## レイヤー構造

```
app/
 └─> handlers/actions/
      └─> usecases/
           └─> repositories/
           └─> lib/
```

## 禁止パターン

| From                             | To                      | 理由                              |
| -------------------------------- | ----------------------- | --------------------------------- |
| `src/app/**`                     | `@/server/repositories` | ビジネスロジックの欠如            |
| `src/app/**`                     | `@/server/lib`          | 技術的詳細の露出                  |
| `src/server/handlers/actions/**` | `@/server/repositories` | ビジネスロジックは usecase に置く |
| `src/server/handlers/actions/**` | `@/server/lib`          | インフラ層への直接依存            |

## メリット

1. **責務の分離**: 各レイヤーの役割が明確になる
2. **テスタビリティ**: usecase 単位でテストしやすい
3. **変更の影響範囲**: 下位レイヤーの変更が上位に影響しにくい
4. **可読性**: 依存関係が明示的で理解しやすい

## 正しいパターン例

```typescript
// ❌ 悪い例
export const getUserAction = async (id: string) => {
  const user = await userRepository.findById(id);
  return user;
};

// ✅ 良い例
// src/server/usecases/user.ts
export const getUserUsecase = async (id: string) => {
  const user = await userRepository.findById(id);
  return ok(user);
};

// src/server/handlers/actions/user.ts
export const getUserAction = withAuth(async (id: string) => {
  return await getUserUsecase(id);
});
```

## 関連ルール

- [no-direct-server-import](../no-direct-server-import/) - server コード全般へのアクセス制限
- [require-result-return-type](../require-result-return-type/) - usecase の戻り値型強制
