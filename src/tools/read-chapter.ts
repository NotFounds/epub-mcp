import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { ToolHandler, createToolResponse } from './base.js';

export const readChapterTool: ToolHandler = {
  definition: {
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
  handler: async (args, epubReader, currentEpubPath) => {
    if (!currentEpubPath) {
      throw new McpError(ErrorCode.InvalidRequest, 'No EPUB file loaded. Use load_epub first.');
    }

    const chapterId = args?.chapterId as string;
    if (!chapterId) {
      throw new McpError(ErrorCode.InvalidParams, 'chapterId is required');
    }

    const chapter = await epubReader.getChapter(chapterId);
    return createToolResponse(JSON.stringify(chapter, null, 2));
  },
};