import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { ToolHandler, createToolResponse } from './base.js';

export const searchContentTool: ToolHandler = {
  definition: {
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
  handler: async (args, epubReader, currentEpubPath) => {
    if (!currentEpubPath) {
      throw new McpError(ErrorCode.InvalidRequest, 'No EPUB file loaded. Use load_epub first.');
    }

    const query = args?.query as string;
    if (!query) {
      throw new McpError(ErrorCode.InvalidParams, 'query is required');
    }

    const results = await epubReader.searchContent(query);
    return createToolResponse(JSON.stringify(results, null, 2));
  },
};