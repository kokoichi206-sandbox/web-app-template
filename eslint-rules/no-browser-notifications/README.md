# no-browser-notifications

ブラウザのネイティブ通知 API (`alert`, `confirm`, `prompt`) の使用を禁止し、プロジェクト独自のコンポーネントの使用を強制する ESLint ルール。

## ルールの詳細

ブラウザの `alert`, `confirm`, `prompt` は UI/UX の観点から望ましくないため、代替手段を使用する。

### ❌ エラー (ブラウザ API を直接使用)

```typescript
// 直接呼び出し
alert("保存しました");
confirm("削除しますか?");
prompt("名前を入力してください");

// window 経由
window.alert("エラーが発生しました");
window.confirm("続行しますか?");

// globalThis 経由
globalThis.alert("警告");
```

### ✅ OK (プロジェクトのフックを使用)

```typescript
import { useToast } from "@/client/hooks/use-toast";
import { useConfirm } from "@/client/hooks/use-confirm";

function MyComponent() {
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const handleSave = async () => {
    toast({ title: "保存しました" });
  };

  const handleDelete = async () => {
    const result = await confirm({
      title: "削除しますか?",
      description: "この操作は取り消せません",
    });

    if (result) {
      // 削除処理
    }
  };
}
```

## 例外

`useConfirm` から分割代入された `confirm` は許可される。

```typescript
const { confirm } = useConfirm();
// この confirm() は OK (ネイティブ confirm ではないため)
await confirm({ title: "確認" });
```

## メリット

1. **一貫した UI/UX**: プロジェクト全体でデザインが統一される
2. **モダンな見た目**: ブラウザ標準の古臭いダイアログを回避
3. **カスタマイズ可能**: デザインや動作を柔軟に調整できる
4. **アクセシビリティ**: ARIA 属性やキーボード操作に対応
5. **非同期対応**: Promise ベースで async/await が使える

## 推奨される代替手段

| ブラウザ API | 代替手段                                      |
| ------------ | --------------------------------------------- |
| `alert()`    | `useToast()` フック                           |
| `confirm()`  | `useConfirm()` フック                         |
| `prompt()`   | カスタムダイアログコンポーネント + Form input |

## 関連リンク

- [useToast の実装](../../src/client/hooks/use-toast.ts)
- [useConfirm の実装](../../src/client/hooks/use-confirm.ts)
