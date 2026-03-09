---
globs:
  - src/**
---

# コーディングベストプラクティス

## マジックナンバーの定数化

重要な数値（API 制限、期間制限など）は定数化し、コメントで理由を明示する。これにより、コードの可読性と保守性が向上する。

**悪い例:**

```typescript
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
const apiStartLimit = new Date(today);
apiStartLimit.setDate(today.getDate() - 29);
```

**良い例:**

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

この方法により、以下のメリットがあります:

- 数値の意味が明確になる
- API 仕様が変更された場合に、定数を一箇所変更するだけで対応できる
- コードレビューで数値の妥当性を判断しやすい

## 型安全な文字列リテラルのチェック

Union 型（例: `"a" | "b" | "c"`）の値を配列でチェックする場合、`.includes()` を使うと型チェックが効かず、typo や存在しない値を指定してもコンパイルエラーになりません。

**悪い例:**

```typescript
type Status = "pending" | "approved" | "rejected";

function isActive(status: Status): boolean {
  // typo や存在しない値を指定してもエラーにならない
  return ["pending", "approvedd"].includes(status);
}
```

**良い例:**

```typescript
type Status = "pending" | "approved" | "rejected";

// Set<Status> を使うことで、型安全にチェックできる
const ACTIVE_STATUSES: Set<Status> = new Set(["pending", "approved"]);

function isActive(status: Status): boolean {
  return ACTIVE_STATUSES.has(status);
}

// typo があるとコンパイルエラー
// const ACTIVE_STATUSES: Set<Status> = new Set(["pending", "approvedd"]);
//                                                          ^^^^^^^^^^
// Type '"approvedd"' is not assignable to type 'Status'
```

この方法により、以下のメリットがあります:

- typo や存在しない値を指定するとコンパイルエラーになる
- 型定義が変更された場合に、関連するコードも更新が必要になることが分かる
- ランタイムパフォーマンスも `Set.has()` の方が `Array.includes()` より高速

## 日付計算とタイムゾーン扱い

日付計算を行う際は、タイムゾーン（UTC vs JST）の扱いを明確にする必要があります。特に外部 API との連携や期間判定を行う場合は注意が必要です。

**重要なポイント:**

- `new Date()` はシステムのローカルタイムゾーンを使用
- `toISOString()` は UTC を返す
- サーバー環境のタイムゾーンに依存しない実装を心がける

**推奨パターン:**

```typescript
// ❌ 悪い例: タイムゾーンが不明確
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
const dateStr = oneYearAgo.toISOString().slice(0, 10);

// ✅ 良い例: タイムゾーンを明示的にコメント
// 1年前の日付をチェック（UTC基準）
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
const dateStr = oneYearAgo.toISOString().slice(0, 10);

// ✅ より良い例: 日本時間（JST）で明示的に計算
const jstOffset = 9 * 60; // JST = UTC+9
const now = new Date();
const jstNow = new Date(now.getTime() + jstOffset * 60 * 1000);
const oneYearAgo = new Date(jstNow);
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
const dateStr = oneYearAgo.toISOString().slice(0, 10);
```

**ガイドライン:**

1. 外部 API が期待するタイムゾーン（UTC or JST）を確認し、コメントで明記する
2. サーバー環境のタイムゾーン設定に依存しない実装を心がける
3. 境界条件（ちょうど 1 年前など）ではタイムゾーンの影響を考慮する
4. 許容誤差が大きい場合（数時間～1 日程度）は UTC ベースでも可

## 環境変数の型安全なアクセス

`process.env` を直接参照せず、必ず `@/shared/env/server-env.ts` 経由で参照する（ESLint ルールで強制）。

```typescript
// ❌ Bad: process.env 直接参照
const apiKey = process.env.API_KEY;

// ✅ Good: 型安全な環境変数アクセス
import { serverEnv } from "@/shared/env/server-env";
const apiKey = serverEnv.API_KEY;
```

## 環境変数のバリデーション

必須の環境変数は Zod スキーマで `.min(1)` を使用し、空文字列を明示的に拒否する。特に認証情報や API キーなどセキュリティに関わる変数は厳密に検証する。

```typescript
// ✅ Good: 空文字列を拒否
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
});
```

## インポートパス

親ディレクトリ相対参照 (`../`) 禁止 → `@/*` エイリアス使用（ESLint ルールで強制）。

```typescript
// ❌ Bad: 親ディレクトリ相対参照
import { db } from "../../../db/client";

// ✅ Good: @/* エイリアス
import { db } from "@/server/db/client";
```

## レビュー指摘の検証

PR レビューで提案された変更を適用する前に、必ず `pnpm build` でビルド確認を実施。特にパフォーマンス最適化の提案は、Server/Client 境界への影響を慎重に検証。
