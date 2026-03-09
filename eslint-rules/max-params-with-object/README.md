# max-params-with-object

引数が多い関数に対してオブジェクト引数 (名前付きパラメータ) の使用を強制する ESLint ルール。

## ルールの詳細

関数の引数が設定値 (デフォルト: 3) を超える場合、オブジェクト分割代入パターンの使用を求める。

### ❌ エラー (引数が 4 つ以上)

```typescript
function createUser(name, email, age, role) {}

const handler = (req, res, next, extra) => {};
```

### ✅ OK (オブジェクト引数)

```typescript
function createUser({ name, email, age, role }: CreateUserParams) {}

const handler = ({ req, res, next, extra }: HandlerParams) => {};
```

### ✅ OK (引数が 3 つ以下)

```typescript
function add(a, b, c) {}
```

### ✅ OK (コールバック関数)

コールバック関数はデフォルトで除外される。

```typescript
[].map((item, index, array, extra) => item);
[].reduce((acc, item, index, array) => acc, {});
```

## オプション

```javascript
"custom/max-params-with-object": ["error", { max: 3, ignoreCallbacks: true }]
```

| オプション        | デフォルト | 説明                                           |
| ----------------- | ---------- | ---------------------------------------------- |
| `max`             | `3`        | 許可する最大パラメータ数。これを超えるとエラー |
| `ignoreCallbacks` | `true`     | コールバック関数を除外するか                   |

## メリット

1. **可読性**: 引数の意味が呼び出し側で明確になる

   ```typescript
   // Before: 何の値か分かりにくい
   createColumnWidthRequest(1, 0, 5, 180);

   // After: 意味が明確
   createColumnWidthRequest({ sheetId: 1, startIndex: 0, endIndex: 5, pixelSize: 180 });
   ```

2. **保守性**: 引数の順序を気にしなくて良い

3. **拡張性**: 新しいプロパティを追加しても既存の呼び出し元への影響が少ない

4. **型安全性**: TypeScript の型チェックがより効果的に機能

## 関連ルール

- [max-params](https://eslint.org/docs/rules/max-params) - ESLint 組み込みの最大引数数ルール (オブジェクトパターンは強制しない)
