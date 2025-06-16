import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { ToolHandler, createToolResponse } from './base.js';

export const listImagesTool: ToolHandler = {
  definition: {
    name: 'list_epub_images',
    description: 'List all images in the loaded EPUB file',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  handler: async (args, epubReader, currentEpubPath) => {
    if (!currentEpubPath) {
      throw new McpError(ErrorCode.InvalidRequest, 'No EPUB file loaded. Use load_epub first.');
    }

    const images = epubReader.getImages();
    return createToolResponse(JSON.stringify(images, null, 2));
  },
};