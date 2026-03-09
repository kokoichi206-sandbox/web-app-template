あなたはこのプロジェクトの監査オーケストレーターである。main ブランチに対して包括的な監査を実行し、結果を GitHub Issue として報告する。

## 概要

5つの専門監査エージェントを並列実行し、結果を集約して GitHub Issue を作成する。

## 監査エージェント

1. **セキュリティ監査** (`references/security.md`)
2. **アーキテクチャ監査** (`references/architecture.md`)
3. **ベストプラクティス監査** (`references/best-practices.md`)
4. **UI/UX 監査** (`references/ui.md`)
5. **依存関係監査** (`references/deps.md`)

## 実行手順

### Step 1: 準備

1. 現在の日付を取得 (YYYY-MM-DD 形式)
2. main ブランチの最新コミットハッシュを取得
3. 出力ディレクトリを作成: `docs/audits/{date}/`

### Step 2: 監査の並列実行

Task tool を使用して、5つの監査エージェントを **並列** で実行する。

各エージェントには以下を指示:

- 該当する `references/*.md` の内容を読み込んで指示に従う
- 出力先: `docs/audits/{date}/{type}.md`
- 対象: main ブランチの現在のスナップショット

**重要**: 5つの Task を **同時に** 発行すること (並列実行)。

```
Task 1: セキュリティ監査
  - プロンプト: references/security.md を読んで実行
  - 出力: docs/audits/{date}/security.md

Task 2: アーキテクチャ監査
  - プロンプト: references/architecture.md を読んで実行
  - 出力: docs/audits/{date}/architecture.md

Task 3: ベストプラクティス監査
  - プロンプト: references/best-practices.md を読んで実行
  - 出力: docs/audits/{date}/best-practices.md

Task 4: UI/UX 監査
  - プロンプト: references/ui.md を読んで実行
  - 出力: docs/audits/{date}/ui.md

Task 5: 依存関係監査
  - プロンプト: references/deps.md を読んで実行
  - 出力: docs/audits/{date}/deps.md
```

### Step 3: 結果の集約

各監査レポートからスコアとサマリーを抽出し、総合レポートを作成。

**重要**: GitHub Issue は自己完結させること。外部ファイルへのリンクは使用せず、Issue 本文とコメントに全ての情報を含める。

### Step 4: GitHub Issue の作成

Issue は以下の構成で作成する:

#### 4.1 Issue 本文

```markdown
# 定期監査レポート - {date}

**対象ブランチ**: main
**コミット**: {commit-hash}
**実施日時**: {datetime}

---

## 総合スコア

| 監査カテゴリ       | スコア   | 重要項目             |
| ------------------ | -------- | -------------------- |
| セキュリティ       | X/10     | 高: X, 中: X, 低: X  |
| アーキテクチャ     | X/10     | 重大: X, 軽微: X     |
| ベストプラクティス | X/10     | 重要: X, 推奨: X     |
| UI/UX              | X/10     | 重大: X, 推奨: X     |
| 依存関係           | X/10     | Critical: X, High: X |
| **総合**           | **X/10** |                      |

---

## 緊急対応が必要な項目

(高リスク/重大/Critical な項目を具体的にリストアップ。ファイルパス、問題内容、推奨対応を含める)

---

## 推奨アクションリスト

(優先度別のチェックリスト形式で記載)

### 即座に対応 (今週中)

- [ ] 具体的なアクション項目

### 次回スプリント

- [ ] 具体的なアクション項目
```

#### 4.2 各監査の詳細コメント (5件)

Issue 作成後、各監査カテゴリの **詳細情報** をコメントとして追加する。
各コメントには以下を含める:

1. **スコアとサマリーテーブル**
2. **検出された全ての問題** (ファイルパス、行番号、問題内容)
3. **具体的な修正案** (コード例があれば含める)
4. **良い点** (維持すべき項目)

```bash
# Issue 作成
gh issue create --title "[Audit] {date} 定期監査レポート" \
  --label "audit,automated" \
  --body "..."

# 各監査の詳細をコメントとして追加
gh issue comment {issue_number} --body "## セキュリティ監査詳細\n\n(検出項目、修正案を全て含める)"
gh issue comment {issue_number} --body "## アーキテクチャ監査詳細\n\n..."
gh issue comment {issue_number} --body "## ベストプラクティス監査詳細\n\n..."
gh issue comment {issue_number} --body "## UI/UX 監査詳細\n\n..."
gh issue comment {issue_number} --body "## 依存関係監査詳細\n\n..."
```

**注意**: コメントが長くなる場合は適切に分割すること。GitHub コメントの文字数制限 (65536文字) に注意。

### Step 5: 完了報告

- 作成した Issue の URL を表示
- 全体のスコアサマリーを表示

## 引数

- `$ARGUMENTS`:
  - 空の場合: 今日の日付を使用
  - 日付指定 (YYYY-MM-DD): 指定した日付を使用
  - `--dry-run`: GitHub Issue を作成せず、ローカルにレポートのみ生成

## 出力

- `docs/audits/{date}/` ディレクトリに全レポートを保存 (ローカル参照用)
- GitHub Issue を作成 (dry-run でない場合)
  - Issue は自己完結しており、外部ファイルへのリンクは含まない
  - 全ての詳細情報は Issue 本文とコメントに含まれる

## 注意事項

- main ブランチに切り替えてから実行すること
- 実行には数分かかる場合がある
- GitHub CLI (`gh`) が認証済みであること
