# no-supabase-data-api

Supabase Data API の利用を禁止する ESLint ルールです。

## 禁止対象

- `supabase.from(...)`
- `supabase.rpc(...)`
- `fetch(".../rest/v1/...")` / `fetch(new URL(".../rest/v1/..."))`

## 許可対象

- Supabase Auth API (`supabase.auth.*`)
- Supabase Storage API (`supabase.storage.from(...).*`)

## 目的

DB アクセスを Prisma に統一し、認証・ストレージ用途の Supabase 利用と責務を分離するため。
