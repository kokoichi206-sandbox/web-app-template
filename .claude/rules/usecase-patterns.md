---
globs:
  - src/server/usecases/**
---

# UseCase 層実装パターン

## 基本原則

UseCase は複数の Repository や外部 API アダプターを組み合わせてビジネスロジックを実装する。

## 標準的な UseCase クラス

```typescript
import "server-only";

import { itemRepository } from "@/server/repositories/item-repository";
import { externalApiClient } from "@/server/lib/adapters/external-api-client";
import { appError, type AppError } from "@/shared/errors";
import { logger } from "@/shared/logger";
import { err, ok, type Result } from "@/shared/result";
import type { Item } from "@/types/item";

class ItemUsecase {
  /**
   * アイテムを作成する
   *
   * - Repository との橋渡し
   * - ビジネスロジックのバリデーション
   * - 外部 API との連携
   */
  async create(userId: string, input: { name: string }): Promise<Result<Item, AppError>> {
    logger.info({ userId, name: input.name }, "アイテム作成開始");

    // 1. ビジネスルールのバリデーション
    if (input.name.length < 3) {
      return err(appError.validation("名前は3文字以上で入力してください"));
    }

    // 2. 外部APIを呼び出す（必要な場合）
    const apiResult = await externalApiClient.validateName(input.name);
    if (!apiResult.ok) {
      return err(appError.api("外部API呼び出しに失敗しました", 500, apiResult.error));
    }

    // 3. Repositoryでデータを永続化
    const itemResult = await itemRepository.create({ ...input, userId });
    if (!itemResult.ok) {
      return err(itemResult.error);
    }

    logger.info({ userId, itemId: itemResult.value.id }, "アイテム作成完了");
    return ok(itemResult.value);
  }
}

export const itemUsecase = new ItemUsecase();
```

## エラー伝播パターン

依存先からのエラーをチェックして `return err(result.error)` で伝播する。新たに発生するエラーは `appError.*()` で生成。

```typescript
async refreshAccounts(
  userId: string
): Promise<Result<DbYahooAccount[], AppError>> {
  // 1. Token 取得
  const tokenResult = await oauthTokenRepository.getValidAccessToken(
    PROVIDER,
    userId
  );
  if (!tokenResult.ok) return err(tokenResult.error);

  // 2. API 呼び出し
  const baseAccountsResult = await client.listBaseAccounts();
  if (!baseAccountsResult.ok) return err(baseAccountsResult.error);

  // 3. 検証
  if (baseAccountsResult.value.length === 0) {
    return err(appError.notFound("Base accounts not found"));
  }

  // 4. Repository に委譲
  const upsertResult = await yahooAccountsRepository.upsertAccounts(rows);
  if (!upsertResult.ok) return err(upsertResult.error);

  return yahooAccountsRepository.listAccounts(userId);
}
```

## ログ出力

UseCase 層では処理の開始・完了をログ出力する。エラーログは withAuth で自動出力されるため不要。

```typescript
logger.info({ userId, name: input.name }, "アイテム作成開始");
// 処理...
logger.info({ userId, itemId: result.value.id }, "アイテム作成完了");
```

## 複数ステップの処理フロー

```typescript
async generateReport(
  userId: string,
  input: GenerateReportInput
): Promise<Result<Report, AppError>> {
  logger.info({ userId, input }, "レポート生成開始");

  // 1. 広告データを取得
  const adsResult = await googleAdsFetcher.fetchCampaigns(
    userId,
    input.customerId,
    input.startDate,
    input.endDate
  );
  if (!adsResult.ok) return err(adsResult.error);

  // 2. スプレッドシート作成
  const sheetResult = await sheetsService.createSpreadsheet(
    userId,
    adsResult.value
  );
  if (!sheetResult.ok) return err(sheetResult.error);

  // 3. Claude AI で分析
  const analysisResult = await claudeService.analyzeData(
    userId,
    sheetResult.value.url
  );
  if (!analysisResult.ok) return err(analysisResult.error);

  // 4. Google Docs にレポート作成
  const docsResult = await docsService.createDocument(
    userId,
    analysisResult.value
  );
  if (!docsResult.ok) return err(docsResult.error);

  // 5. ジョブステータス更新
  const updateResult = await jobRepository.updateStatus({
    jobId: input.jobId,
    status: "completed",
    googleDocsUrl: docsResult.value.url,
    spreadsheetUrl: sheetResult.value.url,
  });
  if (!updateResult.ok) return err(updateResult.error);

  logger.info({ userId, jobId: input.jobId }, "レポート生成完了");
  return ok(docsResult.value);
}
```

## 依存方向の遵守

UseCase は repositories と lib/adapters にのみ依存する。DB には直接依存しない（ESLint ルール `no-direct-layer-import` で強制）。

```typescript
// ✅ Good: Repository 経由で DB アクセス
const result = await itemRepository.findById(itemId);

// ❌ Bad: UseCase から直接 DB アクセス
import { db } from "@/server/db/client";
const result = await db.query.items.findFirst({ where: eq(items.id, itemId) });
```

**参照:** `src/server/usecases/report-generation-usecase.ts`, `src/server/usecases/google-ads-fetcher.ts`
