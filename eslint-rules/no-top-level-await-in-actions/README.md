# no-top-level-await-in-actions

Server Actions でトップレベルの `await` を禁止する ESLint ルール。

## ルールの詳細

サーバーレス環境 (Vercel など) では、トップレベルの `await` がコールドスタート時のパフォーマンスを悪化させるため禁止する。

### ❌ エラー (トップレベル await)

```typescript
// src/server/handlers/actions/user.ts
import { db } from "@/server/db";

// ファイルのトップレベルで await → コールドスタート時に毎回実行される
const connection = await db.connect();

export const getUsers = async () => {
  return await db.select().from(users);
};
```

### ✅ OK (関数内で await)

```typescript
// src/server/handlers/actions/user.ts
import { db } from "@/server/db";

export const getUsers = async () => {
  // 関数内で await → 必要なときだけ実行される
  const connection = await db.connect();
  return await connection.select().from(users);
};
```

## なぜトップレベル await が問題か

### 問題1: コールドスタート時の遅延

```typescript
// ❌ 悪い例
const cache = await initializeCache(); // 起動時に毎回実行

export const getData = async () => {
  return cache.get("key");
};
```

サーバーレス環境では、関数が初めて呼ばれるとき (コールドスタート) にファイル全体が評価される。トップレベルの `await` があると、その完了を待つ必要があり、レスポンスが遅くなる。

### 問題2: 不要な初期化

```typescript
// ❌ 悪い例
const heavyData = await loadHeavyData(); // 使わない場合も実行される

export const action1 = async () => {
  // heavyData を使わない
};

export const action2 = async () => {
  return heavyData; // こちらだけ使う
};
```

### 解決策: 遅延初期化

```typescript
// ✅ 良い例
let cache: Cache | null = null;

const getCache = async () => {
  if (!cache) {
    cache = await initializeCache();
  }
  return cache;
};

export const getData = async () => {
  const c = await getCache(); // 必要なときだけ初期化
  return c.get("key");
};
```

## 対象ディレクトリ

- `src/server/handlers/actions/`

## パフォーマンス比較

### トップレベル await (遅い)

```
コールドスタート → ファイル評価 → await 完了 (500ms) → 関数実行
                                  ^^^^^^^^^^^
                                  毎回待たされる
```

### 関数内 await (速い)

```
コールドスタート → ファイル評価 (即座) → 関数実行 → 必要なら await
                                                    ^^^^^^^^^
                                                    使うときだけ
```

## メリット

1. **高速化**: コールドスタート時の待機時間を削減
2. **効率化**: 不要な初期化を回避
3. **スケーラビリティ**: サーバーレス環境で効率的に動作
4. **ベストプラクティス**: Vercel の推奨パターンに準拠

## 例外

このルールは `src/server/handlers/actions/` 配下のみに適用される。他のサーバーコードでは制限されない。

## 関連リンク

- [Vercel のベストプラクティス](https://vercel.com/docs/functions/serverless-functions/best-practices)
- Next.js Server Actions のドキュメント
