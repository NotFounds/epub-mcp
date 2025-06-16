export interface EpubMetadata {
  title: string;
  creator: string;
  publisher?: string;
  description?: string;
  language?: string;
  date?: string;
  identifier?: string;
  rights?: string;
  subject?: string[];
}

export interface EpubTocItem {
  id: string;
  href: string;
  label: string;
  level: number;
  children?: EpubTocItem[];
}

export interface EpubChapter {
  id: string;
  title: string;
  content: string;
  href: string;
}

export interface EpubImage {
  id: string;
  href: string;
  mediaType: string;
  size?: number;
}

export interface EpubSearchResult {
  chapterId: string;
  chapterTitle: string;
  context: string;
  position: number;
}