import type { MemoryNote, SearchQuery, SearchResult } from "../core/types.js";

export interface SearchBackend {
  readonly name: string;

  /** ripgrep implement เป็น no-op ได้ — ไม่มี index ให้สร้าง */
  index(notes: MemoryNote[]): Promise<void>;

  search(query: SearchQuery): Promise<SearchResult[]>;

  stats(): Promise<{
    indexedCount: number;
    sizeBytes: number;
    buildTimeMs: number;
  }>;
}
