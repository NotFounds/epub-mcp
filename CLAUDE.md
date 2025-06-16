# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with tsx
- `npm run build` - Build TypeScript to JavaScript 
- `npm run typecheck` - Run TypeScript type checking
- `npm start` - Run built server

### MCP Server Usage
The server runs on stdio and communicates via Model Context Protocol. It should be configured in Claude Desktop or other MCP clients.

## Architecture

### Core Components
- `src/index.ts` - MCP server entry point with tool handlers
- `src/epub-tools.ts` - EPUB processing logic using epub2 library
- `src/types.ts` - TypeScript type definitions for EPUB data structures

### Tool Flow
1. `load_epub` must be called first to load an EPUB file
2. Other tools (`read_epub_metadata`, `read_epub_toc`, etc.) operate on the loaded EPUB
3. All tools return JSON-formatted responses

### EPUB Processing
- Uses epub2 library for EPUB parsing
- jsdom for HTML content extraction and cleaning
- Supports metadata, table of contents, chapter reading, full-text search, and image listing

### Error Handling
- Tools validate that EPUB is loaded before operations
- MCP error codes used for consistent error responses
- Graceful handling of malformed EPUB content

## Usage Examples

### Loading and Reading EPUBs
```javascript
// Load an EPUB file
await loadEpub("path/to/book.epub");

// Get metadata
const metadata = await readEpubMetadata();

// Get table of contents
const toc = await readEpubToc();

// Read a specific chapter
const chapter = await readEpubChapter("chapter-id");

// Search content
const results = await searchEpubContent("search term");

// List images
const images = await listEpubImages();
```

### Japanese Language Support
This MCP server has been tested with Japanese EPUB files and properly handles:
- Japanese text extraction and display
- UTF-8 encoding for Japanese characters
- Japanese metadata (titles, authors, etc.)
- Japanese content search

## MCP Client Configuration

Example configuration for Claude Desktop:
```json
{
  "mcpServers": {
    "epub-mcp": {
      "command": "node",
      "args": ["path/to/epub-mcp/dist/index.js"]
    }
  }
}
```

For development:
```json
{
  "mcpServers": {
    "epub-mcp": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "path/to/epub-mcp"
    }
  }
}
```

## Supported File Types
- `.epub` files (EPUB 2.0 and 3.0)
- Works with both English and Japanese EPUBs
- Handles various EPUB internal structures and formats