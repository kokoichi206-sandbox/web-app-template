現在のブランチからデフォルトブランチに向けて Pull Request を作成してください。

## 実行手順

### 0. デフォルトブランチの特定

```bash
gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'
```

以降、取得した値を `{default_branch}` として使用する。

### 1. 事前チェック

#### 1.1 ブランチ確認

- 現在のブランチ名を取得 (`git branch --show-current`)
- デフォルトブランチにいる場合はエラー終了
- 未コミットの変更がある場合は警告を表示し、続行するか確認

#### 1.2 リモートとの同期確認

- `git fetch origin` を実行
- ローカルブランチがリモートにプッシュ済みか確認
- 未プッシュのコミットがある場合は `git push -u origin {branch}` を実行

### 2. ローカルチェックリスト (CI と同等のチェック)

以下のチェックを順番に実行し、全て成功することを確認:

```bash
# 1. 依存関係のインストール
pnpm install

# 2. 未使用エクスポートのチェック
pnpm knip

# 3. Lint チェック
pnpm lint

# 4. Format チェック
pnpm format:check

# 5. ビルド
pnpm build
```

**いずれかのチェックが失敗した場合**:

- 修正を試みる (`pnpm lint-check:fix` 等)
- 自動修正で解決しない場合はエラー内容を表示して終了
- 修正した場合は変更をコミット・プッシュ

### 3. PR 作成

#### 3.1 変更内容の分析

- `git log {default_branch}..HEAD --oneline` でコミット一覧を取得
- `git diff {default_branch}...HEAD --stat` で変更ファイルを確認
- コミットメッセージと変更内容から PR のタイトルと本文を生成

#### 3.2 PR の作成

```bash
gh pr create --base {default_branch} --title "{タイトル}" --body "{本文}"
```

**PR 本文のフォーマット**:

```markdown
## Summary

- {変更点を箇条書き}

## Changes

{変更したファイルの概要}

## Test plan

- [ ] ローカルで動作確認
- [ ] 関連する画面の表示確認

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 4. CI の実行待機

#### 4.1 CI ステータスの監視

PR 作成後、GitHub Actions の CI が完了するまで監視:

```bash
# 30秒間隔で最大20回 (10分) ポーリング
gh pr checks --watch --interval 30
```

#### 4.2 CI 結果の確認

- **成功**: 完了メッセージを表示し、PR URL を出力
- **失敗**: 失敗した job を特定し、ログを取得して問題を分析

  ```bash
  gh run view {run_id} --log-failed
  ```

  - 可能であれば修正を提案または実施
  - 修正後は再度プッシュして CI を再実行

### 5. 結果サマリー

最終的に以下を出力:

- PR URL
- CI ステータス (成功/失敗)
- 変更ファイル数とコミット数
- レビュー依頼の推奨 (必要に応じて)

## 注意事項

- TypeScript の型エラーはビルド時に検出されるため、ビルド成功が必須
- セキュリティ関連の変更がある場合は PR 本文に明記
- DB スキーマ変更がある場合はマイグレーションファイルの同梱を確認
- 大きな変更の場合は PR を分割することを提案

## オプション引数

$ARGUMENTS

引数で以下を指定可能:

- `--draft`: ドラフト PR として作成
- `--skip-ci-wait`: CI の完了を待たずに終了
- `--reviewer {username}`: レビュアーを指定
