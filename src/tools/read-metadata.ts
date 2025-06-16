import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { ToolHandler, createToolResponse } from './base.js';

export const readMetadataTool: ToolHandler = {
  definition: {
    name: 'read_epub_metadata',
    description: 'Get metadata information from the loaded EPUB file',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  handler: async (args, epubReader, currentEpubPath) => {
    if (!currentEpubPath) {
      throw new McpError(ErrorCode.InvalidRequest, 'No EPUB file loaded. Use load_epub first.');
    }

    const metadata = epubReader.getMetadata();
    return createToolResponse(JSON.stringify(metadata, null, 2));
  },
};