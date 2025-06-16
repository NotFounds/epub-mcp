import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const EPub = require('epub2').default;
import { JSDOM } from 'jsdom';
import { promises as fs } from 'fs';
import { EpubMetadata, EpubTocItem, EpubChapter, EpubImage, EpubSearchResult } from './types.js';

export class EpubReader {
  private epub: InstanceType<typeof EPub> | null = null;
  private filePath: string = '';

  async loadEpub(filePath: string): Promise<void> {
    this.filePath = filePath;
    
    return new Promise((resolve, reject) => {
      this.epub = new EPub(filePath);
      
      this.epub.on('end', () => {
        resolve();
      });
      
      this.epub.on('error', (error: any) => {
        reject(error);
      });
      
      this.epub.parse();
    });
  }

  getMetadata(): EpubMetadata {
    if (!this.epub) {
      throw new Error('EPUB not loaded. Call loadEpub() first.');
    }

    const metadata = this.epub.metadata;
    return {
      title: metadata.title || 'Unknown Title',
      creator: metadata.creator || 'Unknown Author',
      publisher: metadata.publisher,
      description: metadata.description,
      language: metadata.language,
      date: metadata.date,
      identifier: metadata.identifier,
      rights: metadata.rights,
      subject: metadata.subject ? (Array.isArray(metadata.subject) ? metadata.subject : [metadata.subject]) : undefined
    };
  }

  getToc(): EpubTocItem[] {
    if (!this.epub) {
      throw new Error('EPUB not loaded. Call loadEpub() first.');
    }

    const convertTocItem = (item: any, level: number = 0): EpubTocItem => {
      const tocItem: EpubTocItem = {
        id: item.id || item.href,
        href: item.href,
        label: item.title || item.label || 'Untitled',
        level
      };

      if (item.children && item.children.length > 0) {
        tocItem.children = item.children.map((child: any) => convertTocItem(child, level + 1));
      }

      return tocItem;
    };

    return this.epub.toc.map((item: any) => convertTocItem(item));
  }

  async getChapter(chapterId: string): Promise<EpubChapter> {
    if (!this.epub) {
      throw new Error('EPUB not loaded. Call loadEpub() first.');
    }

    // If chapterId contains a fragment (#), remove it for manifest lookup
    const cleanChapterId = chapterId.split('#')[0];
    
    // Try to find the chapter by ID first, then by href
    let targetId = chapterId;
    if (!this.epub.manifest[chapterId] && !this.epub.manifest[cleanChapterId]) {
      // Look for the chapter by href
      for (const [id, item] of Object.entries(this.epub.manifest)) {
        const manifestItem = item as any;
        if (manifestItem.href === chapterId || manifestItem.href === cleanChapterId) {
          targetId = id;
          break;
        }
      }
    } else if (this.epub.manifest[cleanChapterId]) {
      targetId = cleanChapterId;
    }

    return new Promise((resolve, reject) => {
      this.epub!.getChapter(targetId, (error: any, text?: string) => {
        if (error) {
          reject(new Error(`Chapter not found: ${chapterId}. Error: ${error.message || error}`));
          return;
        }

        if (!text) {
          reject(new Error(`No text content found for chapter: ${chapterId}`));
          return;
        }
        const dom = new JSDOM(text);
        const document = dom.window.document;
        
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style');
        scripts.forEach(script => script.remove());
        
        // Get text content
        const content = document.body?.textContent || document.textContent || '';
        
        // Get title from h1, h2, or title elements
        const titleElement = document.querySelector('h1, h2, h3, title');
        const title = titleElement?.textContent || `Chapter ${chapterId}`;

        resolve({
          id: chapterId,
          title: title.trim(),
          content: content.trim(),
          href: this.epub!.manifest[targetId]?.href || chapterId
        });
      });
    });
  }

  async searchContent(query: string): Promise<EpubSearchResult[]> {
    if (!this.epub) {
      throw new Error('EPUB not loaded. Call loadEpub() first.');
    }

    const results: EpubSearchResult[] = [];
    const searchRegex = new RegExp(query, 'gi');

    for (const chapterId of Object.keys(this.epub.manifest)) {
      const item = this.epub.manifest[chapterId];
      if (item['media-type'] === 'application/xhtml+xml' || item.href?.endsWith('.html') || item.href?.endsWith('.xhtml')) {
        try {
          const chapter = await this.getChapter(chapterId);
          const matches = [...chapter.content.matchAll(searchRegex)];
          
          for (const match of matches) {
            const position = match.index || 0;
            const contextStart = Math.max(0, position - 100);
            const contextEnd = Math.min(chapter.content.length, position + query.length + 100);
            const context = chapter.content.substring(contextStart, contextEnd);
            
            results.push({
              chapterId,
              chapterTitle: chapter.title,
              context: context.trim(),
              position
            });
          }
        } catch (error) {
          // Skip chapters that can't be read
          continue;
        }
      }
    }

    return results;
  }

  getImages(): EpubImage[] {
    if (!this.epub) {
      throw new Error('EPUB not loaded. Call loadEpub() first.');
    }

    const images: EpubImage[] = [];
    
    for (const [id, item] of Object.entries(this.epub.manifest)) {
      const manifestItem = item as any;
      if (manifestItem['media-type']?.startsWith('image/')) {
        images.push({
          id,
          href: manifestItem.href || '',
          mediaType: manifestItem['media-type'] || ''
        });
      }
    }

    return images;
  }

  async getImage(imageId: string): Promise<Buffer> {
    if (!this.epub) {
      throw new Error('EPUB not loaded. Call loadEpub() first.');
    }

    return new Promise((resolve, reject) => {
      this.epub!.getImage(imageId, (error: any, data?: Buffer, mimeType?: string) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(data || Buffer.alloc(0));
      });
    });
  }
}