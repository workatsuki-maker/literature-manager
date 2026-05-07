# RefManager — 文献管理Webアプリ

修士論文作成のためのPDF付き文献管理ツール。サーバー不要、ブラウザのみで動作します。

## 機能

- **文献登録** — タイトル・著者・発行年・ジャーナル・URL・キーワード・タグ・メモを管理
- **PDFアップロード** — ブラウザ内でPDFをプレビュー表示（IndexedDB保存）
- **URLリンク** — DOIや論文ページURLを登録して詳細画面から直接開ける
- **リアルタイム検索** — タイトル・著者・キーワード・ジャーナル・メモで即座に絞り込み
- **タグフィルタリング** — タグ一覧から複数選択してフィルタリング
- **CSVインポート** — Notionエクスポート CSV を取り込み可能（URL列にも対応）
- **使い方ガイド** — アプリ内に組み込まれたヘルプモーダル
- **データ永続化** — 文献メタ情報はlocalStorage、PDFはIndexedDBに保存

## 起動手順

### 前提条件

- Node.js 18 以上
- npm 9 以上

### インストール & 起動

```bash
# リポジトリのディレクトリへ移動
cd literature-manager

# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

### プロダクションビルド

```bash
npm run build
# dist/ フォルダが生成されます。任意のWebサーバーで配信可能です。
```

## デプロイ（公開ホスティング）

ビルド成果物（`dist/` フォルダ）を静的ホスティングサービスに公開するだけで誰でも使えます。データは各ユーザーのブラウザ内に保存されます。

### Netlify（推奨・無料）

1. [Netlify](https://www.netlify.com/) にサインアップ
2. 「Add new site」→「Deploy manually」を選択
3. `npm run build` 後に生成される `dist/` フォルダをドラッグ＆ドロップ

または GitHub リポジトリと連携すると自動デプロイが可能です（`netlify.toml` が設定済みです）。

### Vercel（無料）

1. [Vercel](https://vercel.com/) にサインアップ
2. GitHub リポジトリをインポート
3. フレームワークは「Vite」を選択（`vercel.json` が設定済みです）

### GitHub Pages

```bash
# gh-pages パッケージをインストール
npm install --save-dev gh-pages

# package.json の scripts に追加後、以下を実行
npm run build
npx gh-pages -d dist
```

> **注意**: GitHub Pages でサブパスにデプロイする場合は `vite.config.js` に `base: '/リポジトリ名/'` を追加してください。

---

## CSVフォーマット

Notionのデータベースエクスポート CSV をそのまま取り込めます。以下の列名に対応しています（日本語・英語どちらも可）。

| フィールド | 認識する列名の例 |
|-----------|----------------|
| タイトル   | `title`, `タイトル`, `name`, `名前`, `論文名` |
| 著者       | `authors`, `著者`, `author` |
| 発行年     | `year`, `発行年`, `published year` |
| ジャーナル | `journal`, `ジャーナル`, `venue`, `conference` |
| キーワード | `keywords`, `キーワード` |
| タグ       | `tags`, `タグ`, `category` |
| メモ       | `notes`, `メモ`, `abstract`, `概要` |
| URL/DOI    | `url`, `link`, `リンク`, `doi` |

複数値（著者・キーワード・タグ）はカンマ・セミコロン・縦棒・読点・中点で区切って記述できます。

### CSVサンプル

```csv
title,authors,year,journal,keywords,tags,notes,url
Attention is All You Need,"Vaswani, A., Shazeer, N.",2017,NeurIPS,"transformer,attention,NLP",読了,Transformerの原著,https://arxiv.org/abs/1706.03762
BERT: Pre-training of Deep Bidirectional Transformers,Devlin J.,2019,NAACL,BERT;NLP;事前学習,重要,双方向Transformerの事前学習,https://arxiv.org/abs/1810.04805
```

## データの保存場所

| データ | 保存先 |
|--------|--------|
| 文献メタ情報 | `localStorage` (`refmanager_data`) |
| PDFファイル  | `IndexedDB` (`refmanager` データベース) |

ブラウザのデータをクリアすると登録内容が消えます。定期的にCSVでバックアップすることを推奨します。

## 技術スタック

- React 18
- Vite 5
- Tailwind CSS 3
