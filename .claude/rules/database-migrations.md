---
globs:
  - prisma/schema.prisma
  - prisma/migrations/**
---

# データベースマイグレーション規約

## IMPORTANT: DB 変更の標準フロー

スキーマ編集後は必ず以下の手順を実行する：

```bash
# 1. スキーマ編集
# prisma/schema.prisma を編集

# 2. マイグレーション生成
pnpm db:generate

# 3. マイグレーション適用（ローカル）
pnpm db:migrate

# 4. 型チェック
pnpm type-check
```

マイグレーションファイルは必ず PR に同梱する。

## DB 命名規則

| 要素             | 規則                                       | 例                                         |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| テーブル名       | 複数形 snake_case                          | `users`, `oauth_tokens`, `items`           |
| カラム名         | snake_case                                 | `user_id`, `created_at`, `account_name`    |
| 外部キー         | `{テーブル名単数}_id`                      | `user_id` (users テーブルの PK を参照)     |
| インデックス     | `{テーブル名}_{用途}_idx`                  | `users_email_idx`, `oauth_tokens_user_idx` |
| 複合主キー       | `{テーブル名}_pk`                          | `items_pk`                                 |
| 一意制約         | `{テーブル名}_{カラム名}_uk`               | `users_email_uk`                           |
| チェック制約     | `{テーブル名}_{用途}_check`                | `jobs_status_check`                        |
| デフォルト値     | `{テーブル名}_{用途}_df`                   | `jobs_created_at_df`                       |
| シーケンス       | `{テーブル名}_{用途}_seq`                  | `jobs_id_seq`                              |
| トリガー         | `{テーブル名}_{用途}_trigger`              | `jobs_update_timestamp_trigger`            |
| ビュー           | `{テーブル名}_view`                        | `jobs_with_account_names_view`             |
| マテビュー       | `{テーブル名}_mv`                          | `jobs_summary_mv`                          |
| パーティション   | `{テーブル名}_{条件}`                      | `jobs_2024_01`, `jobs_2024_02`             |
| 外部キー制約     | `{テーブル名}_{カラム名}_fk`               | `jobs_user_id_fk`                          |
| インデックス     | `{テーブル名}_{カラム名}_idx`              | `jobs_user_id_idx`, `jobs_status_idx`      |
| 複合インデックス | `{テーブル名}_{カラム名1}_{カラム名2}_idx` | `jobs_user_id_status_idx`                  |

## Prisma ORM での実装パターン

```prisma
// ✅ Good: Prisma schema でテーブル名・カラム名を snake_case で定義
model User {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users")
}
```

## Upsert パターン

```typescript
await prisma.item.upsert({
  where: { id },
  update: {
    name: input.name,
    updatedAt: new Date(),
  },
  create: {
    id,
    name: input.name,
  },
});
```

## バッチ操作での安全性

```typescript
/**
 * バッチ INSERT の最大行数。PostgreSQL は 1 クエリあたり最大 65535 パラメータまで
 * 対応だが、PgBouncer やクエリサイズ制限を考慮して安全なサイズに制限する。
 */
const BATCH_INSERT_SIZE = 100;
```

## マイグレーション実行前の確認事項

1. **既存データへの影響**: NOT NULL 追加、カラム削除などはデータ移行が必要
2. **インデックスの追加**: 大きなテーブルでは時間がかかるため、ダウンタイムを考慮
3. **外部キー制約**: 既存データとの整合性を確認
4. **デフォルト値**: 既存レコードへの影響を確認

## schema 変更時の型定義更新

Prisma Client は `prisma generate` で自動生成されるため、スキーマ変更後は必ず再生成する。
アプリケーション層で使用する型は `src/types/` に定義して公開する。

```prisma
// prisma/schema.prisma
model Job {
  id     String @id @default(cuid())
  userId String @map("user_id")
  status String

  @@map("jobs")
}
```

```typescript
// src/types/job.ts
export type Job = {
  id: string;
  userId: string;
  status: JobStatus;
  // ...
};
```

schema 変更時は対応する `src/types/*.ts` の更新も必須。

**参照:** `prisma/schema.prisma`, `prisma/migrations/`, `src/types/`
