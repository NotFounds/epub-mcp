import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { ToolHandler, createToolResponse } from './base.js';

export const loadEpubTool: ToolHandler = {
  definition: {
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
  handler: async (args, epubReader) => {
    const filePath = args?.filePath as string;
    if (!filePath) {
      throw new McpError(ErrorCode.InvalidParams, 'filePath is required');
    }

    await epubReader.loadEpub(filePath);
    return createToolResponse(`Successfully loaded EPUB file: ${filePath}`);
  },
};