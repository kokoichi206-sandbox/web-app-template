# require-ui-storybook-story

`src/client/components/ui` 配下の UI コンポーネントに Storybook ファイルを必須化する ESLint ルールです。

## ルール

- 対象: `src/client/components/ui/**/*.tsx`
- 必須: 同階層に対応する `*.stories.tsx` が存在すること

例:

- `src/client/components/ui/Button.tsx` がある場合
- `src/client/components/ui/Button.stories.tsx` が必須

## 除外

- `*.stories.tsx`
- `*.test.tsx`
- `*.spec.tsx`
- `index.tsx`
