# Learn from Review - PRレビュー指摘の自動学習・仕組み化

PRのレビューコメントを分析し、同じ指摘を繰り返さないための改善を自動的に仕組み化する。

## 引数

- `prNumber` (必須): 分析対象のPR番号

## 重要: 改善の採用基準

### PR を作成する条件

以下の**全て**を満たす改善点がある場合のみ PR を作成する:

1. **汎用性がある**: 他のPRや今後の開発でも適用できる一般的なルール
2. **反省的スキル**: 具体的な実装詳細ではなく、考え方やアプローチに関するもの
3. **再発防止効果が高い**: 同様のミスを防ぐ効果が明確に期待できる

### PR を作成しない条件

以下のいずれかに該当する場合は PR を作成せず、「改善点なし」として終了する:

- **具体的すぎる指摘**: 特定のファイルや実装に限定された指摘
- **typo や単純なミス**: 一般化できない単発のミス
- **既存ルールでカバー済み**: CLAUDE.md や ESLint で既にルール化されている
- **コンテキスト依存が強い**: その PR 特有の状況にのみ当てはまる
- **軽微な改善**: ドキュメントの追加や些細なコードスタイル

### 良い改善の例

- ❌ 「`src/server/handlers/actions/foo.ts` で `async/await` を使い忘れた」
- ✅ 「非同期処理のエラーハンドリングパターンを統一する」

- ❌ 「OAuth トークンの暗号化に AES-256 を使用する」
- ✅ 「機密情報は保存前に必ず暗号化する (実装詳細は都度判断)」

- ❌ 「`useEffect` の依存配列に `userId` を追加する」
- ✅ 「React Hooks の依存配列は ESLint の警告を無視せず、適切に設定する」

## 処理フロー

### 1. レビューコメントの収集

GitHub Actions から渡される `/tmp/review-data/` ディレクトリの JSON ファイルを読み込む:

- `review_comments.json`: コード行へのレビューコメント
- `reviews.json`: レビュー本体 (Approve/Request changes)
- `issue_comments.json`: PR全体へのコメント
- `pr_info.json`: PR自体の情報

ローカル実行の場合は `gh` コマンドで取得:

```bash
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments --paginate
gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews --paginate
gh api repos/{owner}/{repo}/issues/{pr_number}/comments --paginate
```

### 2. コメントの分類と分析

各コメントを以下のカテゴリに分類:

| カテゴリ                 | 説明                             | 改善方法                  |
| ------------------------ | -------------------------------- | ------------------------- |
| **コードスタイル**       | フォーマット、命名規則、一貫性   | ESLint ルール             |
| **設計・アーキテクチャ** | レイヤー分離、依存関係、パターン | CLAUDE.md / Steering      |
| **セキュリティ**         | 脆弱性、入力検証、認証           | ESLint ルール / CLAUDE.md |
| **パフォーマンス**       | 効率、最適化、リソース管理       | CLAUDE.md                 |
| **エラーハンドリング**   | 例外処理、エラーメッセージ       | ESLint ルール / CLAUDE.md |
| **テスト**               | テストカバレッジ、テスト設計     | CLAUDE.md / Skills        |
| **ドキュメント**         | コメント、型定義、API仕様        | CLAUDE.md                 |
| **その他**               | 上記に該当しない指摘             | CLAUDE.md                 |

### 3. 改善アクションの決定

分類結果に基づいて、最適な改善方法を選択:

#### ESLint ルールを作成する場合

以下の条件を全て満たす場合:

- AST で検出可能なパターンである
- 明確なルール化が可能（例外が少ない）
- 自動修正が可能または明確なエラーメッセージが出せる

`/create-eslint-rule` スキルを使用して作成。

#### CLAUDE.md を更新する場合

以下の条件のいずれかを満たす場合:

- プロジェクト全体に適用される一般的なガイドライン
- コンテキストに依存する判断が必要
- ESLint では検出困難なパターン

#### Skills を作成/更新する場合

以下の条件を満たす場合:

- 特定のワークフローやプロセスに関する指摘
- 複数ステップの作業手順が必要
- 再利用可能なパターン

### 4. 改善の実装

#### 4.1 ESLint ルール作成

```
/create-eslint-rule
ルール名: {rule-name}
目的: {レビュー指摘から抽出した目的}
検出パターン: {AST パターンの説明}
```

#### 4.2 CLAUDE.md 更新

`CLAUDE.md` の適切なセクションにルールを追記:

```markdown
## 重要なルール

{既存のルール}

N. **{新しいルール名}**: {ルールの説明} → {推奨される対応}
```

#### 4.3 Steering 更新

`.kiro/steering/` 配下のファイルを更新:

- `tech.md`: 技術的な制約やパターン
- `structure.md`: アーキテクチャやファイル構造
- `product.md`: プロダクト要件や UX ガイドライン

### 5. 改善の必要性判断

**このステップは必須**: 改善アクションを実行する前に、上記「改善の採用基準」に照らして判断する。

#### 判断フロー

```
1. 分析結果から改善候補をリストアップ
2. 各候補について以下をチェック:
   - [ ] 他のPRでも適用できる汎用性があるか?
   - [ ] 具体的な実装詳細ではなく、考え方・アプローチに関するものか?
   - [ ] 既存のルールでカバーされていないか?
3. 全てのチェックを満たす候補がない場合 → PR作成をスキップ
4. 満たす候補がある場合 → 次のステップへ
```

#### 改善点がない場合の終了

```
## Learn from Review - PR #{prNumber} 分析結果

### 分析したコメント
- レビューコメント: {count} 件
- レビュー: {count} 件
- Issue コメント: {count} 件

### 結論
仕組み化すべき汎用的な改善点はありませんでした。
以下の理由により PR の作成をスキップします:

- {理由1: 例) 指摘は特定の実装に限定されており、一般化できない}
- {理由2: 例) 既存の ESLint ルールでカバー済み}
```

### 6. PR 作成

**改善の必要性が確認できた場合のみ**、改善内容を含む PR を作成:

```bash
# ブランチ作成
git checkout -b learn-from-review/pr-{prNumber}

# 変更をコミット
git add -A
git commit -m "chore: learn from PR #{prNumber} review comments

## 改善内容
{改善の概要}

## 対象のレビュー指摘
{分析したコメントの要約}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# PR作成者を取得（pr_info.json から、失敗時は gh コマンドで取得）
if [ -f /tmp/review-data/pr_info.json ]; then
  PR_AUTHOR=$(jq -r '.user.login' /tmp/review-data/pr_info.json 2>/dev/null) || \
    PR_AUTHOR=$(gh pr view {prNumber} --json author --jq '.author.login')
else
  PR_AUTHOR=$(gh pr view {prNumber} --json author --jq '.author.login')
fi

# PR 作成（元PRの作成者をレビュワーに設定）
gh pr create \
  --title "chore: PR #{prNumber} のレビュー指摘から学習した改善" \
  --body "..." \
  --label "automated" \
  --reviewer "$PR_AUTHOR"
```

> **Note**: 元PRの作成者をレビュワーに設定することで、レビュー指摘を受けた本人が改善内容を確認できます。

## 出力形式

処理完了後、以下の形式でサマリーを出力:

```
## Learn from Review - PR #{prNumber} 分析結果

### 分析したコメント
- レビューコメント: {count} 件
- レビュー: {count} 件
- Issue コメント: {count} 件

### 分類結果
| カテゴリ | 件数 | 主な指摘 |
|---------|------|----------|
| ... | ... | ... |

### 実施した改善
1. **{改善タイプ}**: {説明}
   - ファイル: {path}
   - 内容: {概要}

### 作成した PR
- #{pr_number}: {title}
```

## 注意事項

1. **重複チェック**: 既存のルールと重複する改善は行わない
2. **過度な一般化を避ける**: 1回の指摘で汎用的なルールを作りすぎない
3. **人間のレビューを促す**: 自動生成した改善は必ず PR でレビューを受ける
4. **コンテキストを保持**: なぜその改善が必要かの経緯を記録する
5. **抽象度を保つ**: 具体的な実装詳細ではなく、考え方やアプローチレベルで記述する
6. **PR 作成は慎重に**: 意味のある改善がない場合は PR を作成しない

## 関連ファイル

- ESLint ルール: `eslint-rules/`
- CLAUDE.md: `CLAUDE.md`
- Steering: `.kiro/steering/`
- Skills: `.claude/skills/`
