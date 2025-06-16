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
import { tools } from './tools/index.js';

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
    tools: tools.map(tool => tool.definition),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const tool = tools.find(t => t.definition.name === name);
    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }

    const result = await tool.handler(args, epubReader, currentEpubPath);
    
    if (name === 'load_epub') {
      currentEpubPath = args?.filePath as string;
    }

    return result;
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