# no-pino-object-in-second-arg

Pino ロガーで、メタデータやエラーオブジェクトを第1引数に渡すことを強制する ESLint ルール。

## ルールの詳細

Pino のベストプラクティスに従い、構造化ログのためメタデータは第1引数、メッセージは第2引数に渡す。

### ❌ エラー (メタデータが第2引数)

```typescript
logger.info("User created", { userId: 123 });
// メタデータが第2引数 → 構造化されない

logger.error("Failed to save", error);
// エラーが第2引数 → シリアライズされない
```

### ✅ OK (メタデータが第1引数)

```typescript
logger.info({ userId: 123 }, "User created");
// メタデータが第1引数 → 構造化ログ

logger.error({ err: error }, "Failed to save");
// err キーでエラー → 自動シリアライズ
```

## エラーオブジェクトのキー名

Pino のデフォルトシリアライザーは `err` キーを特別扱いする。

### ❌ エラー (間違ったキー名)

```typescript
logger.error({ error: e }, "Failed");
// error キーは展開されない

logger.error({ parseError: e }, "Parse failed");
// parseError キーも展開されない
```

### ✅ OK (err キーを使用)

```typescript
logger.error({ err: e }, "Failed");
// err キーでエラー情報が自動展開される
```

## 自動修正

このルールは自動修正をサポートしている。

### 修正例1: 引数順序の入れ替え

```typescript
// Before (自動修正前)
logger.info("User created", { userId: 123 });

// After (自動修正後)
logger.info({ userId: 123 }, "User created");
```

### 修正例2: エラーキー名の統一

```typescript
// Before (自動修正前)
logger.error({ error: e }, "Failed");

// After (自動修正後)
logger.error({ err: e }, "Failed");
```

## メリット

1. **構造化ログ**: メタデータがログ解析ツールで検索可能になる
2. **エラー情報の充実**: スタックトレースが自動的に記録される
3. **パフォーマンス**: Pino の最適化が効く
4. **一貫性**: ログフォーマットがプロジェクト全体で統一される

## 関連リンク

- [Pino 公式ドキュメント](https://github.com/pinojs/pino)
- [Pino シリアライザー](https://github.com/pinojs/pino-std-serializers)
