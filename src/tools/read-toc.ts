import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { ToolHandler, createToolResponse } from './base.js';

export const readTocTool: ToolHandler = {
  definition: {
    name: 'read_epub_toc',
    description: 'Get the table of contents from the loaded EPUB file',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  handler: async (args, epubReader, currentEpubPath) => {
    if (!currentEpubPath) {
      throw new McpError(ErrorCode.InvalidRequest, 'No EPUB file loaded. Use load_epub first.');
    }

    const toc = epubReader.getToc();
    return createToolResponse(JSON.stringify(toc, null, 2));
  },
};