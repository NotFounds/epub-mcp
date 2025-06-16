import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { EpubReader } from '../epub-tools.js';

export interface ToolHandler {
  definition: Tool;
  handler: (args: any, epubReader: EpubReader, currentEpubPath: string | null) => Promise<any>;
}

export function createToolResponse(content: string) {
  return {
    content: [
      {
        type: 'text' as const,
        text: content,
      },
    ],
  };
}