# EPUB MCP Server

EPUB 形式のファイルを読み取るための Model Context Protocol (MCP) サーバーです。LLM が EPUB の内容にアクセスし、活用できるようにします。

## 機能

- EPUB のメタデータ取得
- 目次（Table of Contents）の取得
- 章/セクション単位での内容読み取り
- EPUB 内容の全文検索
- EPUB 内画像の一覧取得

## インストール

```bash
npm install
```

## ビルド

```bash
npm run build
```

## 提供ツール

###  `load_epub`
EPUB ファイルを読み込みます。

**パラメータ:**
- `filePath` (string): 読み込む EPUB ファイルのパス

###  `read_epub_metadata`
読み込まれた EPUB ファイルのメタデータを取得します。

**戻り値:** タイトル、著者、出版社などの情報

###  `read_epub_toc`
読み込まれた EPUB ファイルの目次を取得します。

**戻り値:** 階層構造の目次情報

###  `read_epub_chapter`
指定した章やセクションの内容を読み取ります。

**パラメータ:**
- `chapterId` (string): 読み取る章の ID または href

###  `search_epub_content`
EPUB 内容を検索します。

**パラメータ:**
- `query` (string): 検索するテキスト

### `list_epub_images`
EPUB 内の画像一覧を取得します。

## 技術仕様

- Node.js 18.0.0以上
- TypeScript
- Model Context Protocol SDK
- epub2 (EPUB解析)
- jsdom (HTML解析)
