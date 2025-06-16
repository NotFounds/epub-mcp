#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { EpubReader } from './epub-tools.js';

const server = new Server(
  {
    name: 'epub-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const epubReader = new EpubReader();
let currentEpubPath: string | null = null;

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'load_epub',
        description: 'Load an EPUB file for reading',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the EPUB file to load',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'read_epub_metadata',
        description: 'Get metadata information from the loaded EPUB file',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'read_epub_toc',
        description: 'Get the table of contents from the loaded EPUB file',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'read_epub_chapter',
        description: 'Read a specific chapter from the loaded EPUB file',
        inputSchema: {
          type: 'object',
          properties: {
            chapterId: {
              type: 'string',
              description: 'ID or href of the chapter to read',
            },
          },
          required: ['chapterId'],
        },
      },
      {
        name: 'search_epub_content',
        description: 'Search for text content within the loaded EPUB file',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Text to search for in the EPUB content',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'list_epub_images',
        description: 'List all images in the loaded EPUB file',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'load_epub': {
        const filePath = args?.filePath as string;
        if (!filePath) {
          throw new McpError(ErrorCode.InvalidParams, 'filePath is required');
        }

        await epubReader.loadEpub(filePath);
        currentEpubPath = filePath;

        return {
          content: [
            {
              type: 'text',
              text: `Successfully loaded EPUB file: ${filePath}`,
            },
          ],
        };
      }

      case 'read_epub_metadata': {
        if (!currentEpubPath) {
          throw new McpError(ErrorCode.InvalidRequest, 'No EPUB file loaded. Use load_epub first.');
        }

        const metadata = epubReader.getMetadata();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(metadata, null, 2),
            },
          ],
        };
      }

      case 'read_epub_toc': {
        if (!currentEpubPath) {
          throw new McpError(ErrorCode.InvalidRequest, 'No EPUB file loaded. Use load_epub first.');
        }

        const toc = epubReader.getToc();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(toc, null, 2),
            },
          ],
        };
      }

      case 'read_epub_chapter': {
        if (!currentEpubPath) {
          throw new McpError(ErrorCode.InvalidRequest, 'No EPUB file loaded. Use load_epub first.');
        }

        const chapterId = args?.chapterId as string;
        if (!chapterId) {
          throw new McpError(ErrorCode.InvalidParams, 'chapterId is required');
        }

        const chapter = await epubReader.getChapter(chapterId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(chapter, null, 2),
            },
          ],
        };
      }

      case 'search_epub_content': {
        if (!currentEpubPath) {
          throw new McpError(ErrorCode.InvalidRequest, 'No EPUB file loaded. Use load_epub first.');
        }

        const query = args?.query as string;
        if (!query) {
          throw new McpError(ErrorCode.InvalidParams, 'query is required');
        }

        const results = await epubReader.searchContent(query);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'list_epub_images': {
        if (!currentEpubPath) {
          throw new McpError(ErrorCode.InvalidRequest, 'No EPUB file loaded. Use load_epub first.');
        }

        const images = epubReader.getImages();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(images, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('EPUB MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});