# enforce-naming-convention

ファイル・ディレクトリの命名規則を強制する ESLint ルール。

## ルールの詳細

Next.js プロジェクトのファイル・ディレクトリ命名を統一する。

### ❌ エラー (不正な命名)

```typescript
// src/app/myPage/page.tsx
// ディレクトリ名が camelCase → エラー

// src/components/my-component.tsx
// TSXファイルが kebab-case → エラー

// src/server/MyService.ts
// TSファイルが PascalCase → エラー
```

### ✅ OK (正しい命名)

```typescript
// src/app/my-page/page.tsx
// ルートディレクトリは kebab-case

// src/components/MyComponent.tsx
// TSXファイルは PascalCase

// src/server/my-service.ts
// TSファイルは kebab-case

// src/components/index.ts
// index ファイルは常に OK
```

### ✅ OK (Next.js 特殊ファイル)

```typescript
// Next.js の特殊ファイル名は小文字で OK
page.tsx;
layout.tsx;
loading.tsx;
error.tsx;
not - found.tsx;
route.ts;
middleware.ts;
```

## 命名ルール一覧

| 対象                          | 命名規則    | 例                           |
| ----------------------------- | ----------- | ---------------------------- |
| Route ディレクトリ (page.tsx) | kebab-case  | `user-profile/`, `my-posts/` |
| `.tsx` ファイル               | PascalCase  | `UserProfile.tsx`            |
| `.ts` ファイル                | kebab-case  | `user-service.ts`            |
| `index.ts` / `index.tsx`      | 常に許可    | `index.ts`                   |
| Next.js 特殊ファイル          | 小文字 OK   | `page.tsx`, `layout.tsx`     |
| 動的ルート                    | `[id]` OK   | `[userId]/page.tsx`          |
| ルートグループ                | `(auth)` OK | `(dashboard)/layout.tsx`     |

## 例外パターン

- `[userId]` などの動的ルートディレクトリ
- `(dashboard)` などのルートグループ
- `_components` などのプライベートフォルダ
- `@modal` などのパラレルルート

## メリット

1. **一貫性**: プロジェクト全体で命名規則が統一される
2. **可読性**: ファイル種別が名前から判別しやすい
3. **衝突回避**: kebab-case により大文字小文字の衝突を防ぐ
4. **Next.js 互換**: Next.js の規約に準拠

## 関連ルール

- Next.js の公式命名規約に準拠
