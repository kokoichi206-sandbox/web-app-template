# max-api-route-handler-lines

API Route ハンドラーの行数を制限し、ロジックを `src/server/` に分離することを強制する ESLint ルール。

## ルールの詳細

API Route ファイル (`src/app/api/**/route.ts`) は薄く保ち、ビジネスロジックは `src/server/` に配置する。

### ❌ エラー (行数が多すぎる)

```typescript
// src/app/api/users/route.ts (120行)
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

export async function GET(request: Request) {
  // バリデーション (10行)
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  // ...

  // ビジネスロジック (50行)
  const offset = (page - 1) * limit;
  const userList = await db.select().from(users).limit(limit).offset(offset);
  // ...

  // レスポンス整形 (30行)
  const formatted = userList.map((user) => ({
    // ...
  }));
  // ...

  return NextResponse.json(formatted);
}
```

### ✅ OK (ロジックを分離)

```typescript
// src/app/api/users/route.ts (30行)
import { NextResponse } from "next/server";
import { getUserListUsecase } from "@/server/usecases/user";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");

  const result = await getUserListUsecase({ page });

  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json(result.value);
}
```

```typescript
// src/server/usecases/user.ts (分離されたロジック)
export const getUserListUsecase = async ({ page }: { page: number }) => {
  const limit = 20;
  const offset = (page - 1) * limit;

  const userList = await db.select().from(users).limit(limit).offset(offset);

  return ok(userList);
};
```

## デフォルト設定

- 最大行数: **80行** (コメント・空行を除く)
- 対象: `src/app/api/**/route.ts`

## オプション

```javascript
// eslint.config.mjs
{
  rules: {
    "custom/max-api-route-handler-lines": ["error", { maxLines: 80 }],
  },
}
```

## 分離先の推奨

| ロジックの種類    | 分離先                          |
| ----------------- | ------------------------------- |
| ビジネスロジック  | `src/server/usecases/`          |
| データアクセス    | `src/server/repositories/`      |
| 外部 API 呼び出し | `src/server/lib/adapters/`      |
| バリデーション    | Zod スキーマ + `src/types/`     |
| レスポンス整形    | `src/server/usecases/` の戻り値 |

## メリット

1. **テスタビリティ**: ロジックが分離されているため、単体テストしやすい
2. **再利用性**: 同じロジックを他のエンドポイントでも使える
3. **可読性**: Route ファイルが薄くなり、フローが理解しやすい
4. **保守性**: ロジックの変更が局所化される

## パターン比較

### ❌ Fat Route (非推奨)

```typescript
// src/app/api/users/route.ts
export async function POST(request: Request) {
  // バリデーション (20行)
  // ビジネスロジック (50行)
  // データ保存 (30行)
  // メール送信 (20行)
  // レスポンス (10行)
}
```

### ✅ Thin Route (推奨)

```typescript
// src/app/api/users/route.ts (20行)
export async function POST(request: Request) {
  const body = await request.json();
  const result = await createUserUsecase(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  return NextResponse.json(result.value, { status: 201 });
}
```

## 行数のカウント方法

以下は行数にカウントされない:

- 空行
- コメント行 (`//`, `/* */`)

## 関連ルール

- [no-direct-layer-import](../no-direct-layer-import/) - レイヤー境界の強制
- [require-result-return-type](../require-result-return-type/) - usecase の戻り値型
