---
globs:
  - src/server/repositories/**
---

# Repository 層実装パターン

## 基本原則

Repository は DB テーブルに対する CRUD 操作を提供し、必ず Result 型を返す（ESLint ルール `require-result-return-type` で強制）。

## 標準的な Repository クラス

```typescript
import "server-only";

import { prisma } from "@/server/db/client";
import { appError, type DbError } from "@/shared/errors";
import { err, ok, okVoid, safeTry, type Result } from "@/shared/result";
import type { Item } from "@/types/item";

class ItemRepository {
  /**
   * アイテムを作成する
   */
  async create(input: { name: string; userId: string }): Promise<Result<Item, DbError>> {
    const result = await safeTry(() => prisma.item.create({ data: input }));

    if (!result.ok) {
      return err(appError.db("アイテムの作成に失敗しました", result.error));
    }

    return ok(result.value);
  }

  /**
   * アイテムを更新する（upsert パターン）
   */
  async upsert(id: string, input: Partial<Item>): Promise<Result<Item, DbError>> {
    const result = await safeTry(() =>
      prisma.item.upsert({
        where: { id },
        update: input,
        create: { id, ...input },
      })
    );

    if (!result.ok) {
      return err(appError.db("アイテムの更新に失敗しました", result.error));
    }

    return ok(result.value);
  }

  /**
   * アイテムを取得する
   */
  async findById(id: string): Promise<Result<Item | null, DbError>> {
    const result = await safeTry(() => prisma.item.findUnique({ where: { id } }));

    if (!result.ok) {
      return err(appError.db("アイテムの取得に失敗しました", result.error));
    }

    return ok(result.value ?? null);
  }
}

export const itemRepository = new ItemRepository();
```

## バッチ INSERT パターン

```typescript
/**
 * バッチ INSERT の最大行数。PostgreSQL は 1 クエリあたり最大 65535 パラメータまで
 * 対応だが、PgBouncer やクエリサイズ制限を考慮して安全なサイズに制限する。
 */
const BATCH_INSERT_SIZE = 100;

/**
 * 複数レコードを一括挿入する
 */
async insertMany(data: NewItem[]): Promise<Result<void, DbError>> {
  if (data.length === 0) {
    return okVoid();
  }

  const result = await safeTry(() => prisma.item.createMany({ data }));

  if (!result.ok) {
    return err(appError.db("一括挿入に失敗しました", result.error));
  }

  return okVoid();
}
```

## Upsert パターンの詳細

```typescript
/**
 * アカウント情報を更新または挿入する
 */
async upsertAccounts(rows: NewAccount[]): Promise<Result<void, DbError>> {
  if (!rows.length) return okVoid();

  const result = await safeTry(() =>
    prisma.$transaction(
      rows.map((row) =>
        prisma.account.upsert({
          where: {
            userId_accountId: {
              userId: row.userId,
              accountId: row.accountId,
            },
          },
          update: {
            accountName: row.accountName,
            fetchedAt: row.fetchedAt,
          },
          create: row,
        })
      )
    )
  );

  if (!result.ok) {
    return err(appError.db("保存に失敗しました", result.error));
  }

  return okVoid();
}
```

## クエリの可読性

複雑なクエリは専用関数に切り出し、意図を関数名で表現する。

```typescript
// ❌ Bad: 複雑なクエリをインラインで記述
const jobs = await prisma.job.findMany({
  where: { userId, status: "completed" },
  orderBy: { createdAt: "desc" },
  take: 10,
});

// ✅ Good: 意図を関数名で表現
async findRecentCompletedJobs(
  userId: string,
  limit: number
): Promise<Result<Job[], DbError>> {
  const result = await safeTry(() =>
    prisma.job.findMany({
      where: { userId, status: "completed" },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  );

  if (!result.ok) {
    return err(appError.db("ジョブ取得に失敗しました", result.error));
  }

  return ok(result.value);
}
```

## マジックナンバーの定数化

重要な数値（API 制限、期間制限など）は定数化し、コメントで理由を明示する。

```typescript
/**
 * 外部 API のデータ取得可能期間（日数）。
 * API 仕様に基づき、過去30日間のデータを取得可能。
 */
const DATA_RETENTION_DAYS = 30;
const LOOKBACK_DAYS = DATA_RETENTION_DAYS - 1;

const thirtyDaysAgo = new Date(now.getTime() - DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000);
const apiStartLimit = new Date(today);
apiStartLimit.setDate(today.getDate() - LOOKBACK_DAYS);
```

**参照:** `src/server/repositories/`
