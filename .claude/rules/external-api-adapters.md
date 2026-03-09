---
globs:
  - src/server/lib/adapters/**
---

# 外部 API アダプター実装パターン

## 目的

外部 API を隠蔽し、プロジェクト固有のインターフェースを提供する。将来の差し替えを容易にする。

## 実装方針

- `lib/adapters/{service}/` に配置
- Factory パターン（credentials 管理）と Client パターン（API 呼び出し）を分離
- 戻り値は Result<T, AppError>

## Factory パターン（認証情報の管理）

```typescript
import "server-only";

import { ExternalApiClient } from "external-api-sdk";
import { oauthTokenRepository } from "@/server/repositories/oauth-token-repository";
import { decryptText } from "@/server/lib/security/encryption";
import { serverEnv } from "@/shared/env/server-env";
import { appError, type AppError } from "@/shared/errors";
import { logger } from "@/shared/logger";
import { err, ok, type Result } from "@/shared/result";

type ExternalClient = ExternalApiClient;

class ExternalApiClientFactory {
  async createClient(userId: string): Promise<Result<ExternalClient, AppError>> {
    // 1. OAuth トークンを取得
    const tokenResult = await oauthTokenRepository.getToken("external_api", userId);
    if (!tokenResult.ok) {
      return err(tokenResult.error);
    }

    // 2. 暗号化されたトークンを復号化
    const decryptResult = decryptText(tokenResult.value.refreshToken);
    if (!decryptResult.ok) {
      return err(appError.config(decryptResult.error));
    }

    // 3. クライアントを生成
    const client = new ExternalApiClient({
      apiKey: serverEnv.EXTERNAL_API_KEY,
      refreshToken: decryptResult.value,
    });

    logger.debug({ userId }, "External API Client created");
    return ok(client);
  }
}

export const externalApiClientFactory = new ExternalApiClientFactory();
```

## Client ラッパー（API 呼び出しの抽象化）

```typescript
import "server-only";

import { externalApiClientFactory } from "./external-api-client-factory";
import { appError, type AppError } from "@/shared/errors";
import { logger } from "@/shared/logger";
import { err, ok, safeTry, type Result } from "@/shared/result";

class ExternalApiFetcher {
  async fetchData(userId: string, query: string): Promise<Result<Data[], AppError>> {
    // 1. Clientを生成
    const clientResult = await externalApiClientFactory.createClient(userId);
    if (!clientResult.ok) {
      return err(clientResult.error);
    }

    const client = clientResult.value;

    // 2. API呼び出し
    const result = await safeTry(() => client.query(query));
    if (!result.ok) {
      logger.error({ userId, query, err: result.error }, "External API call failed");
      return err(appError.api("データ取得に失敗しました", 500, result.error));
    }

    return ok(result.value);
  }
}

export const externalApiFetcher = new ExternalApiFetcher();
```

## 具体的な外部 API Client の実装例

```typescript
class PaymentApiClientFactory {
  async createClient(
    userId: string,
    options?: { merchantId?: string }
  ): Promise<Result<PaymentApiClient, AppError>> {
    // 1. Token 取得（暗号化解除）
    const tokenResult = await oauthTokenRepository.getToken(PROVIDER, userId);
    if (!tokenResult.ok) return err(tokenResult.error);

    // 2. Config チェック
    const apiKey = serverEnv.PAYMENT_API_KEY;
    if (!apiKey) return err(appError.config("API key missing"));

    // 3. Client 生成
    const client = new PaymentApi({
      clientId: serverEnv.PAYMENT_CLIENT_ID,
      clientSecret: serverEnv.PAYMENT_CLIENT_SECRET,
      apiKey,
    });

    const merchantClient = client.merchant({
      merchantId: options?.merchantId,
      accessToken: tokenResult.value.accessToken,
    });

    return ok(merchantClient);
  }
}
```

## エラーハンドリング

外部 API のエラーは `appError.api()` でラップし、統一的に扱う。

```typescript
const result = await safeTry(() => client.query(query));
if (!result.ok) {
  logger.error({ userId, query, err: result.error }, "API call failed");
  return err(appError.api("データ取得に失敗しました", 500, result.error));
}
```

## ログ出力

- **Debug レベル**: Client 生成時
- **Error レベル**: API 呼び出し失敗時

```typescript
logger.debug({ userId }, "API Client created");
logger.error({ userId, query, err: result.error }, "API call failed");
```

## トークンの暗号化・復号化

OAuth トークンは必ず暗号化して DB に保存する。復号化は Factory 内で行う。

```typescript
// 暗号化（Repository層）
const encryptedToken = encryptText(accessToken);
await oauthTokenRepository.upsertToken({
  userId,
  provider,
  accessToken: encryptedToken,
});

// 復号化（Factory層）
const decryptResult = decryptText(tokenResult.value.refreshToken);
if (!decryptResult.ok) {
  return err(appError.config(decryptResult.error));
}
```

**参照:** `src/server/lib/adapters/`
