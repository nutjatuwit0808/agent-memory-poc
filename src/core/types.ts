export type Layer =
  | "convention"
  | "structure"
  | "business-logic"
  | "deployment"
  | "support-case";

export interface MemoryNote {
  id: string; // relative path จาก vault root
  content: string;
  layer: Layer;
  tags: string[];
  createdAt: string; // ISO 8601
  links: string[]; // wikilink targets
}

export interface SearchQuery {
  text: string;
  layer?: Layer;
  tags?: string[];
  limit?: number;
}

export interface SearchResult {
  note: MemoryNote;
  score: number;
  matchedBy: "keyword" | "fts" | "vector";
}
