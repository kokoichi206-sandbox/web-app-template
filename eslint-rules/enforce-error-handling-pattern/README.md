# enforce-error-handling-pattern

try-catch ブロックでの適切なエラーハンドリングパターンを強制する ESLint ルール。

## ルールの詳細

catch したエラーは必ず伝播させる (throw または return) ことで、エラーの握りつぶしを防ぐ。

### ❌ エラー (エラーを握りつぶす)

```typescript
try {
  await operation();
} catch (error) {
  console.error(error);
  // エラーを握りつぶす → 呼び出し側はエラーに気づかない
}
```

### ✅ OK (エラーを伝播)

#### パターン1: throw で再スロー

```typescript
try {
  await operation();
} catch (error) {
  logger.error({ err: error }, "Operation failed");
  throw error; // エラーを再スロー
}
```

#### パターン2: Result で返す

```typescript
try {
  const result = await operation();
  return ok(result);
} catch (error) {
  logger.error({ err: error }, "Operation failed");
  return err(error); // エラーを Result で返す
}
```

## チェック内容

### 1. エラーの伝播

catch ブロック内に以下のいずれかが必要:

- `throw` 文
- `return` 文

### 2. ロガーの使用

`console.error` ではなく `logger.error` を使用する。

#### ❌ エラー

```typescript
try {
  await operation();
} catch (error) {
  console.error(error); // console.error は非推奨
  throw error;
}
```

#### ✅ OK

```typescript
try {
  await operation();
} catch (error) {
  logger.error({ err: error }, "Operation failed");
  throw error;
}
```

## レベル設定

このルールは `warn` レベルで設定されている。

```javascript
// eslint.config.mjs
rules: {
  "custom/enforce-error-handling-pattern": "warn",
}
```

**理由**: 一部のケースでは意図的にエラーを伝播させない場合がある

- 複数データ取得で一部失敗しても続行する
- ログ出力のみの失敗処理
- フォールバック処理

## 対象ディレクトリ

- `src/server/` 配下のみ

クライアントコードは対象外。

## パターン例

### パターン1: エラーログ + 再スロー

```typescript
try {
  await updateUser(userId, data);
} catch (error) {
  logger.error({ err: error, userId }, "Failed to update user");
  throw error;
}
```

### パターン2: エラーログ + Result 返却

```typescript
try {
  const user = await fetchUser(userId);
  return ok(user);
} catch (error) {
  logger.error({ err: error, userId }, "Failed to fetch user");
  return err(new Error("User fetch failed"));
}
```

### パターン3: 条件分岐でエラー処理

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error({ err: error }, "Risky operation failed");

  if (isRetryable(error)) {
    return await retry();
  } else {
    throw error;
  }
}
```

## メリット

1. **エラー追跡**: エラーが適切にログに記録される
2. **デバッグ**: エラーの原因特定が容易になる
3. **堅牢性**: エラーの握りつぶしを防ぐ
4. **一貫性**: プロジェクト全体でエラーハンドリングが統一される

## 例外ケース

以下のような場合は、意図的にエラーを伝播させないことがある:

```typescript
// 複数データ取得で一部失敗してもOK
const results = await Promise.allSettled(
  ids.map(async (id) => {
    try {
      return await fetchData(id);
    } catch (error) {
      logger.error({ err: error, id }, "Failed to fetch data");
      // ここでは throw しない (他のデータ取得を継続)
      return null;
    }
  })
);
```

このような場合は `// eslint-disable-next-line` で無効化する。

## 関連ルール

- [no-throw-statement](../no-throw-statement/) - throw の禁止
- [require-result-return-type](../require-result-return-type/) - Result 型の強制
- [no-pino-object-in-second-arg](../no-pino-object-in-second-arg/) - ロガーの使い方
