---
name: create-eslint-rule
description: カスタム ESLint ルールを作成します。ESLint ルール、lint ルール、コード規約の追加、静的解析ルールの作成時に使用してください。
---

# ESLint ルール作成 Skill

指定された仕様に基づいてカスタム ESLint ルールを作成します。

## 前提条件

- ESLint ルールは JavaScript (.js) で記述する
- 各ルールはディレクトリ構造で管理する
- テストを必ず書く
- 作成後は eslint.config.mjs に追加する

## ディレクトリ構造

```
eslint-rules/
├── index.js                          # ルールのエクスポート
├── {rule-name}/
│   ├── rule.js                       # ルール本体
│   └── test.js                       # テスト (RuleTester 使用)
└── {another-rule}/
    ├── rule.js
    ├── test.js
    └── fixtures/                     # (オプション) テスト用フィクスチャ
        ├── valid.ts
        └── invalid.ts
```

## 実行手順

### 1. 仕様の確認

ユーザーから以下の情報を収集:

- **ルール名**: kebab-case で命名 (例: `require-server-only`, `no-hardcoded-secrets`)
- **目的**: 何を検出/禁止するルールか
- **対象ファイル**: どのファイルに適用するか (例: `src/server/**/*.ts`)
- **自動修正**: --fix で自動修正可能にするか
- **エラーレベル**: error / warn

### 2. 既存ルールの参照

既存のカスタムルールを参考にする:

```bash
ls eslint-rules/
cat eslint-rules/require-server-only/rule.js
cat eslint-rules/require-server-only/test.js
```

### 3. ルールディレクトリの作成

`eslint-rules/{rule-name}/rule.js` を作成:

```javascript
/**
 * ESLint rule to {description}
 *
 * {詳細な説明}
 */

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem", // "problem" | "suggestion" | "layout"
    docs: {
      description: "{ルールの説明}",
      recommended: true,
    },
    fixable: "code", // 自動修正可能な場合のみ
    messages: {
      messageId: "{エラーメッセージ}",
    },
    schema: [],
  },

  create(context) {
    return {
      // AST ノードに対するビジターパターン
    };
  },
};
```

### 4. テストファイルの作成

`eslint-rules/{rule-name}/test.js` を作成:

```javascript
#!/usr/bin/env node

/**
 * Tests for {rule-name} ESLint rule
 */
const { RuleTester } = require("eslint");
const rule = require("./rule");

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("{rule-name}", rule, {
  valid: [
    {
      code: `// valid code`,
      filename: "/project/src/example.ts",
    },
  ],

  invalid: [
    {
      code: `// invalid code`,
      filename: "/project/src/example.ts",
      errors: [{ messageId: "messageId" }],
      output: `// fixed code`, // fixable の場合のみ
    },
  ],
});

// eslint-disable-next-line no-console
console.log("All tests passed! ✨");
```

### 5. index.js への登録

`eslint-rules/index.js` にルールを追加:

```javascript
const requireServerOnly = require("./require-server-only/rule");
const newRule = require("./{rule-name}/rule");

module.exports = {
  rules: {
    "require-server-only": requireServerOnly,
    "{rule-name}": newRule,
  },
};
```

### 6. eslint.config.mjs への追加

ルールを適用する設定を追加:

```javascript
// Custom rule: {rule description}
{
  files: ["{対象ファイルパターン}"],
  plugins: {
    custom: customRules,
  },
  rules: {
    "custom/{rule-name}": "error",
  },
},
```

### 7. テストの実行

```bash
pnpm exec node eslint-rules/{rule-name}/test.js
pnpm lint
```

## チェックリスト

- [ ] ルールディレクトリ (`eslint-rules/{rule-name}/`) を作成
- [ ] ルールファイル (`rule.js`) を作成
- [ ] テストファイル (`test.js`) を作成
- [ ] `eslint-rules/index.js` にルールを登録
- [ ] `eslint.config.mjs` に設定を追加
- [ ] テストが全て pass することを確認
- [ ] `pnpm lint` が正常に動作することを確認

## 注意事項

- AST Explorer (https://astexplorer.net/) を使って AST 構造を確認すると便利
- context.report() でエラーを報告する
- fixable にする場合は fixer を使って修正コードを生成
- ファイルパスのチェックには context.filename を使用
- Windows パスにも対応すること (`/` と `\\` の両方をチェック)

## 既存ルール一覧

| ルール名                       | 説明                                                               |
| ------------------------------ | ------------------------------------------------------------------ |
| `require-server-only`          | `src/server/` 配下のファイルに `import 'server-only'` を強制       |
| `enforce-naming-convention`    | ファイル名の命名規則を強制 (.tsx は PascalCase、.ts は kebab-case) |
| `no-pino-object-in-second-arg` | pino ログのメタデータオブジェクトを第一引数に強制                  |
