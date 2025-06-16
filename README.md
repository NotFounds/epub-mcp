# EPUB MCP Server

EPUB形式のファイルを読み取るためのModel Context Protocol (MCP) サーバーです。LLMがEPUB書籍の内容にアクセスし、活用できるようにします。

## 機能

- EPUB書籍のメタデータ取得
- 目次（Table of Contents）の取得
- 章/セクション単位での内容読み取り
- EPUB内容の全文検索
- EPUB内画像の一覧取得

## インストール

```bash
npm install
```

## ビルド

```bash
npm run build
```

## 開発実行

```bash
npm run dev
```

## 本番実行

```bash
npm start
```

## 提供ツール

### 1. `load_epub`
EPUB ファイルを読み込みます。

**パラメータ:**
- `filePath` (string): 読み込むEPUBファイルのパス

### 2. `read_epub_metadata`
読み込まれたEPUBファイルのメタデータを取得します。

**戻り値:** タイトル、著者、出版社などの情報

### 3. `read_epub_toc`
読み込まれたEPUBファイルの目次を取得します。

**戻り値:** 階層構造の目次情報

### 4. `read_epub_chapter`
指定した章やセクションの内容を読み取ります。

**パラメータ:**
- `chapterId` (string): 読み取る章のIDまたはhref

### 5. `search_epub_content`
EPUB内容を検索します。

**パラメータ:**
- `query` (string): 検索するテキスト

### 6. `list_epub_images`
EPUB内の画像一覧を取得します。

## 使用例

1. EPUB ファイルを読み込む
2. メタデータや目次を確認
3. 特定の章を読み取る
4. 必要に応じて内容を検索

## 技術仕様

- Node.js 18.0.0以上
- TypeScript
- Model Context Protocol SDK
- epub2 (EPUB解析)
- jsdom (HTML解析)