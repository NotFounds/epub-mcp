import { describe, it, expect, beforeEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { EpubReader } from './epub-tools.js';
import { tools } from './tools/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('MCP Server Integration', () => {
  let server: Server;
  let epubReader: EpubReader;
  let currentEpubPath: string | null;
  const testEpubPath = path.join(__dirname, '__tests__/accessible_epub_3.epub');

  beforeEach(() => {
    server = new Server(
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

    epubReader = new EpubReader();
    currentEpubPath = null;

    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: tools.map(tool => tool.definition),
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const tool = tools.find(t => t.definition.name === name);
      if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
      }

      const result = await tool.handler(args, epubReader, currentEpubPath);
      
      if (name === 'load_epub') {
        currentEpubPath = args?.filePath as string;
      }

      return result;
    });
  });

  describe('Tool Registration', () => {
    it('should list all available tools', async () => {
      const request = { method: 'tools/list' };
      const handler = server['_requestHandlers'].get('tools/list');
      const response = await handler(request);

      expect(response.tools).toHaveLength(6);
      const toolNames = response.tools.map((t: any) => t.name);
      expect(toolNames).toContain('load_epub');
      expect(toolNames).toContain('read_epub_metadata');
      expect(toolNames).toContain('read_epub_toc');
      expect(toolNames).toContain('read_epub_chapter');
      expect(toolNames).toContain('search_epub_content');
      expect(toolNames).toContain('list_epub_images');
    });
  });

  describe('Tool Execution Flow', () => {
    it('should execute complete EPUB workflow', async () => {
      const callHandler = server['_requestHandlers'].get('tools/call');
      
      // Load EPUB
      const loadResponse = await callHandler({
        method: 'tools/call',
        params: {
          name: 'load_epub',
          arguments: { filePath: testEpubPath }
        }
      });
      expect(loadResponse.content[0].text).toContain('Successfully loaded EPUB file');

      // Get metadata
      const metadataResponse = await callHandler({
        method: 'tools/call',
        params: {
          name: 'read_epub_metadata',
          arguments: {}
        }
      });
      const metadata = JSON.parse(metadataResponse.content[0].text);
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('creator');

      // Get table of contents
      const tocResponse = await callHandler({
        method: 'tools/call',
        params: {
          name: 'read_epub_toc',
          arguments: {}
        }
      });
      const toc = JSON.parse(tocResponse.content[0].text);
      expect(Array.isArray(toc)).toBe(true);

      // Read a chapter if TOC has entries
      if (toc.length > 0) {
        const chapterResponse = await callHandler({
          method: 'tools/call',
          params: {
            name: 'read_epub_chapter',
            arguments: { chapterId: toc[0].id }
          }
        });
        const chapter = JSON.parse(chapterResponse.content[0].text);
        expect(chapter).toHaveProperty('id');
        expect(chapter).toHaveProperty('title');
        expect(chapter).toHaveProperty('content');
      }

      // Search content
      const searchResponse = await callHandler({
        method: 'tools/call',
        params: {
          name: 'search_epub_content',
          arguments: { query: 'the' }
        }
      });
      const searchResults = JSON.parse(searchResponse.content[0].text);
      expect(Array.isArray(searchResults)).toBe(true);

      // List images
      const imagesResponse = await callHandler({
        method: 'tools/call',
        params: {
          name: 'list_epub_images',
          arguments: {}
        }
      });
      const images = JSON.parse(imagesResponse.content[0].text);
      expect(Array.isArray(images)).toBe(true);
    });

    it('should handle errors when EPUB not loaded', async () => {
      const callHandler = server['_requestHandlers'].get('tools/call');
      
      await expect(callHandler({
        method: 'tools/call',
        params: {
          name: 'read_epub_metadata',
          arguments: {}
        }
      })).rejects.toThrow();
    });

    it('should handle invalid tool names', async () => {
      const callHandler = server['_requestHandlers'].get('tools/call');
      
      await expect(callHandler({
        method: 'tools/call',
        params: {
          name: 'invalid_tool',
          arguments: {}
        }
      })).rejects.toThrow();
    });
  });
});