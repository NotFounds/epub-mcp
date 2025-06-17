import { describe, it, expect, beforeEach } from 'vitest';
import { EpubReader } from '../epub-tools.js';
import { tools } from './index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Tool Handlers', () => {
  let epubReader: EpubReader;
  const testEpubPath = path.join(__dirname, '../__tests__/accessible_epub_3.epub');

  beforeEach(() => {
    epubReader = new EpubReader();
  });

  describe('load_epub tool', () => {
    it('should load EPUB successfully', async () => {
      const loadTool = tools.find(t => t.definition.name === 'load_epub')!;
      const result = await loadTool.handler({ filePath: testEpubPath }, epubReader, null);
      
      expect(result.content[0].text).toContain('Successfully loaded EPUB file');
    });

    it('should throw error for missing filePath', async () => {
      const loadTool = tools.find(t => t.definition.name === 'load_epub')!;
      
      await expect(loadTool.handler({}, epubReader, null)).rejects.toThrow('filePath is required');
    });

    it('should throw error for invalid file path', async () => {
      const loadTool = tools.find(t => t.definition.name === 'load_epub')!;
      
      await expect(loadTool.handler({ filePath: 'invalid.epub' }, epubReader, null)).rejects.toThrow();
    });
  });

  describe('read_epub_metadata tool', () => {
    it('should return metadata after loading EPUB', async () => {
      // Load EPUB first
      const loadTool = tools.find(t => t.definition.name === 'load_epub')!;
      await loadTool.handler({ filePath: testEpubPath }, epubReader, null);

      // Get metadata
      const metadataTool = tools.find(t => t.definition.name === 'read_epub_metadata')!;
      const result = await metadataTool.handler({}, epubReader, testEpubPath);
      
      const metadata = JSON.parse(result.content[0].text);
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('creator');
    });

    it('should throw error when EPUB not loaded', async () => {
      const metadataTool = tools.find(t => t.definition.name === 'read_epub_metadata')!;
      
      await expect(metadataTool.handler({}, epubReader, null)).rejects.toThrow('No EPUB file loaded');
    });
  });

  describe('read_epub_toc tool', () => {
    it('should return table of contents after loading EPUB', async () => {
      // Load EPUB first
      const loadTool = tools.find(t => t.definition.name === 'load_epub')!;
      await loadTool.handler({ filePath: testEpubPath }, epubReader, null);

      // Get TOC
      const tocTool = tools.find(t => t.definition.name === 'read_epub_toc')!;
      const result = await tocTool.handler({}, epubReader, testEpubPath);
      
      const toc = JSON.parse(result.content[0].text);
      expect(Array.isArray(toc)).toBe(true);
    });

    it('should throw error when EPUB not loaded', async () => {
      const tocTool = tools.find(t => t.definition.name === 'read_epub_toc')!;
      
      await expect(tocTool.handler({}, epubReader, null)).rejects.toThrow('No EPUB file loaded');
    });
  });

  describe('read_epub_chapter tool', () => {
    it('should return chapter content after loading EPUB', async () => {
      // Load EPUB first
      const loadTool = tools.find(t => t.definition.name === 'load_epub')!;
      await loadTool.handler({ filePath: testEpubPath }, epubReader, null);

      // Get TOC to find valid chapter ID
      const tocTool = tools.find(t => t.definition.name === 'read_epub_toc')!;
      const tocResult = await tocTool.handler({}, epubReader, testEpubPath);
      const toc = JSON.parse(tocResult.content[0].text);

      if (toc.length > 0) {
        // Read chapter
        const chapterTool = tools.find(t => t.definition.name === 'read_epub_chapter')!;
        const result = await chapterTool.handler({ chapterId: toc[0].id }, epubReader, testEpubPath);
        
        const chapter = JSON.parse(result.content[0].text);
        expect(chapter).toHaveProperty('id');
        expect(chapter).toHaveProperty('title');
        expect(chapter).toHaveProperty('content');
      }
    });

    it('should throw error when EPUB not loaded', async () => {
      const chapterTool = tools.find(t => t.definition.name === 'read_epub_chapter')!;
      
      await expect(chapterTool.handler({ chapterId: 'test' }, epubReader, null)).rejects.toThrow('No EPUB file loaded');
    });

    it('should throw error for missing chapterId', async () => {
      // Load EPUB first
      const loadTool = tools.find(t => t.definition.name === 'load_epub')!;
      await loadTool.handler({ filePath: testEpubPath }, epubReader, null);

      const chapterTool = tools.find(t => t.definition.name === 'read_epub_chapter')!;
      
      await expect(chapterTool.handler({}, epubReader, testEpubPath)).rejects.toThrow('chapterId is required');
    });
  });

  describe('search_epub_content tool', () => {
    it('should return search results after loading EPUB', async () => {
      // Load EPUB first
      const loadTool = tools.find(t => t.definition.name === 'load_epub')!;
      await loadTool.handler({ filePath: testEpubPath }, epubReader, null);

      // Search content
      const searchTool = tools.find(t => t.definition.name === 'search_epub_content')!;
      const result = await searchTool.handler({ query: 'the' }, epubReader, testEpubPath);
      
      const searchResults = JSON.parse(result.content[0].text);
      expect(Array.isArray(searchResults)).toBe(true);
    });

    it('should throw error when EPUB not loaded', async () => {
      const searchTool = tools.find(t => t.definition.name === 'search_epub_content')!;
      
      await expect(searchTool.handler({ query: 'test' }, epubReader, null)).rejects.toThrow('No EPUB file loaded');
    });

    it('should throw error for missing query', async () => {
      // Load EPUB first
      const loadTool = tools.find(t => t.definition.name === 'load_epub')!;
      await loadTool.handler({ filePath: testEpubPath }, epubReader, null);

      const searchTool = tools.find(t => t.definition.name === 'search_epub_content')!;
      
      await expect(searchTool.handler({}, epubReader, testEpubPath)).rejects.toThrow('query is required');
    });
  });

  describe('list_epub_images tool', () => {
    it('should return images list after loading EPUB', async () => {
      // Load EPUB first
      const loadTool = tools.find(t => t.definition.name === 'load_epub')!;
      await loadTool.handler({ filePath: testEpubPath }, epubReader, null);

      // List images
      const imagesTool = tools.find(t => t.definition.name === 'list_epub_images')!;
      const result = await imagesTool.handler({}, epubReader, testEpubPath);
      
      const images = JSON.parse(result.content[0].text);
      expect(Array.isArray(images)).toBe(true);
    });

    it('should throw error when EPUB not loaded', async () => {
      const imagesTool = tools.find(t => t.definition.name === 'list_epub_images')!;
      
      await expect(imagesTool.handler({}, epubReader, null)).rejects.toThrow('No EPUB file loaded');
    });
  });
});