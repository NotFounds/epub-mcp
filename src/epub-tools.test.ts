import { describe, it, expect, beforeEach } from 'vitest';
import { EpubReader } from './epub-tools.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('EpubReader', () => {
  let epubReader: EpubReader;
  const testEpubPath = path.join(__dirname, '__tests__/accessible_epub_3.epub');

  beforeEach(() => {
    epubReader = new EpubReader();
  });

  describe('loadEpub', () => {
    it('should load an EPUB file successfully', async () => {
      await expect(epubReader.loadEpub(testEpubPath)).resolves.not.toThrow();
    });

    it('should throw error for non-existent file', async () => {
      await expect(epubReader.loadEpub('non-existent.epub')).rejects.toThrow();
    });
  });

  describe('getMetadata', () => {
    it('should throw error when EPUB not loaded', () => {
      expect(() => epubReader.getMetadata()).toThrow('EPUB not loaded. Call loadEpub() first.');
    });

    it('should return metadata after loading EPUB', async () => {
      await epubReader.loadEpub(testEpubPath);
      const metadata = epubReader.getMetadata();
      
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('creator');
      expect(typeof metadata.title).toBe('string');
      expect(typeof metadata.creator).toBe('string');
    });
  });

  describe('getToc', () => {
    it('should throw error when EPUB not loaded', () => {
      expect(() => epubReader.getToc()).toThrow('EPUB not loaded. Call loadEpub() first.');
    });

    it('should return table of contents after loading EPUB', async () => {
      await epubReader.loadEpub(testEpubPath);
      const toc = epubReader.getToc();
      
      expect(Array.isArray(toc)).toBe(true);
      if (toc.length > 0) {
        expect(toc[0]).toHaveProperty('id');
        expect(toc[0]).toHaveProperty('href');
        expect(toc[0]).toHaveProperty('label');
        expect(toc[0]).toHaveProperty('level');
      }
    });
  });

  describe('getChapter', () => {
    it('should throw error when EPUB not loaded', async () => {
      await expect(epubReader.getChapter('chapter1')).rejects.toThrow('EPUB not loaded. Call loadEpub() first.');
    });

    it('should return chapter content after loading EPUB', async () => {
      await epubReader.loadEpub(testEpubPath);
      const toc = epubReader.getToc();
      
      if (toc.length > 0) {
        const chapter = await epubReader.getChapter(toc[0].id);
        expect(chapter).toHaveProperty('id');
        expect(chapter).toHaveProperty('title');
        expect(chapter).toHaveProperty('content');
        expect(chapter).toHaveProperty('href');
        expect(typeof chapter.content).toBe('string');
      }
    });

    it('should throw error for non-existent chapter', async () => {
      await epubReader.loadEpub(testEpubPath);
      await expect(epubReader.getChapter('non-existent-chapter')).rejects.toThrow();
    });
  });

  describe('searchContent', () => {
    it('should throw error when EPUB not loaded', async () => {
      await expect(epubReader.searchContent('test')).rejects.toThrow('EPUB not loaded. Call loadEpub() first.');
    });

    it('should return search results after loading EPUB', async () => {
      await epubReader.loadEpub(testEpubPath);
      const results = await epubReader.searchContent('the');
      
      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('chapterId');
        expect(results[0]).toHaveProperty('chapterTitle');
        expect(results[0]).toHaveProperty('context');
        expect(results[0]).toHaveProperty('position');
      }
    });

    it('should return empty array for non-matching search', async () => {
      await epubReader.loadEpub(testEpubPath);
      const results = await epubReader.searchContent('xyzabc123nonexistent');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('getImages', () => {
    it('should throw error when EPUB not loaded', () => {
      expect(() => epubReader.getImages()).toThrow('EPUB not loaded. Call loadEpub() first.');
    });

    it('should return images list after loading EPUB', async () => {
      await epubReader.loadEpub(testEpubPath);
      const images = epubReader.getImages();
      
      expect(Array.isArray(images)).toBe(true);
      if (images.length > 0) {
        expect(images[0]).toHaveProperty('id');
        expect(images[0]).toHaveProperty('href');
        expect(images[0]).toHaveProperty('mediaType');
        expect(images[0].mediaType).toMatch(/^image\//);
      }
    });
  });

  describe('getImage', () => {
    it('should throw error when EPUB not loaded', async () => {
      await expect(epubReader.getImage('image1')).rejects.toThrow('EPUB not loaded. Call loadEpub() first.');
    });

    it('should return image buffer for valid image ID', async () => {
      await epubReader.loadEpub(testEpubPath);
      const images = epubReader.getImages();
      
      if (images.length > 0) {
        const imageData = await epubReader.getImage(images[0].id);
        expect(Buffer.isBuffer(imageData)).toBe(true);
      }
    });
  });
});