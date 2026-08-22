import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { embed } from "./embedder.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const EMBEDDING_CACHE_DB_PATH = join(__dirname, "..", "..", "..", "data", "embeddings.sqlite");

/**
 * key รวม model name เข้าไปด้วยเสมอ — เปลี่ยน model แล้วเวกเตอร์เก่าใช้ไม่ได้เพราะอยู่
 * คนละสเปซกัน (จุดนี้เป็น bug ที่เจอบ่อยในระบบจริงถ้าลืมใส่ model name ใน cache key)
 */
function cacheKey(model: string, text: string): string {
  return createHash("sha256").update(`${model}:${text}`, "utf-8").digest("hex");
}

export class EmbeddingCache {
  private db: Database.Database;

  constructor(dbPath: string = EMBEDDING_CACHE_DB_PATH) {
    this.db = new Database(dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS embedding_cache (
        key TEXT PRIMARY KEY,
        vector BLOB NOT NULL,
        dim INTEGER NOT NULL
      )
    `);
  }

  get(model: string, text: string): Float32Array | undefined {
    const row = this.db.prepare("SELECT vector, dim FROM embedding_cache WHERE key = ?").get(cacheKey(model, text)) as
      | { vector: Buffer; dim: number }
      | undefined;
    if (!row) return undefined;
    // copy ไป ArrayBuffer ใหม่ที่ offset 0 เสมอ กัน alignment ผิดพลาดตอน view เป็น Float32Array
    const arrayBuffer = row.vector.buffer.slice(row.vector.byteOffset, row.vector.byteOffset + row.vector.byteLength);
    return new Float32Array(arrayBuffer as ArrayBuffer);
  }

  set(model: string, text: string, vector: Float32Array): void {
    const buf = Buffer.from(vector.buffer, vector.byteOffset, vector.byteLength);
    this.db
      .prepare("INSERT OR REPLACE INTO embedding_cache (key, vector, dim) VALUES (?, ?, ?)")
      .run(cacheKey(model, text), buf, vector.length);
  }

  get size(): number {
    const row = this.db.prepare("SELECT COUNT(*) AS c FROM embedding_cache").get() as { c: number };
    return row.c;
  }

  close(): void {
    this.db.close();
  }
}

export interface EmbedWithCacheResult {
  vectors: Float32Array[];
  hits: number;
  misses: number;
  embedMs: number; // เวลาที่เสียไปกับการเรียก model จริง (0 ถ้า cache hit หมด)
}

/**
 * Embed texts โดยเช็ค cache ก่อนเสมอ — เฉพาะตัวที่ miss เท่านั้นที่เรียก model จริง
 * นี่คือสิ่งที่ทำให้เห็นว่าต้นทุน embedding เป็น one-time ต่อ content ไม่ใช่ต่อ reindex
 */
export async function embedWithCache(cache: EmbeddingCache, model: string, texts: string[]): Promise<EmbedWithCacheResult> {
  const cached = texts.map((t) => cache.get(model, t));
  const missIndices: number[] = [];
  cached.forEach((v, i) => {
    if (v === undefined) missIndices.push(i);
  });

  let embedMs = 0;
  if (missIndices.length > 0) {
    const missTexts = missIndices.map((i) => texts[i]!);
    const result = await embed(missTexts);
    embedMs = result.embedMs;
    missIndices.forEach((idx, j) => {
      const vector = result.vectors[j]!;
      cached[idx] = vector;
      cache.set(model, texts[idx]!, vector);
    });
  }

  return {
    vectors: cached as Float32Array[],
    hits: texts.length - missIndices.length,
    misses: missIndices.length,
    embedMs,
  };
}
