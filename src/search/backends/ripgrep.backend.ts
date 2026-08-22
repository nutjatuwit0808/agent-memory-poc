import { spawn } from "node:child_process";
import { z } from "zod";
import type { MemoryNote, SearchQuery, SearchResult } from "../../core/types.js";
import type { SearchBackend } from "../backend.interface.js";

// เฉพาะ event type "match" เท่านั้นที่ backend นี้สนใจ — begin/end/summary
// ใช้แค่ตอน spike (W1-1) เพื่อดูโครง ไม่ต้อง validate เข้มก็ได้ตอน parse จริง
const rgMatchEventSchema = z.object({
  type: z.literal("match"),
  data: z.object({
    path: z.object({ text: z.string() }),
    submatches: z.array(z.object({ match: z.object({ text: z.string() }) })),
  }),
});

function installInstructions(): string {
  return [
    "[ripgrep.backend] ไม่พบคำสั่ง `rg` ใน PATH — ต้องติดตั้งก่อนใช้ backend นี้",
    "  Windows: winget install BurntSushi.ripgrep.MSVC",
    "  macOS:   brew install ripgrep",
    "  Linux:   apt install ripgrep  (หรือ dnf/pacman ตาม distro)",
  ].join("\n");
}

function checkRgAvailable(): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("rg", ["--version"]);
    proc.on("error", () => reject(new Error(installInstructions())));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(installInstructions()));
    });
  });
}

function toPosixPath(p: string): string {
  return p.split("\\").join("/");
}

/** ตัดคำจาก query ด้วย whitespace — แต่ละคำกลายเป็น -F pattern แยก (rg รวมหลาย -e ด้วย OR) */
function splitWords(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.length > 0);
}

interface RgMatchGroup {
  path: string;
  matchCount: number;
}

/**
 * spawn `rg --json -F -e <word1> -e <word2> ... --type md <vaultRoot>` แล้วรวมจำนวน
 * match ต่อไฟล์ — ไม่ได้ parse field อื่นเพราะ scoring (W1-3) ต้องการแค่ path + จำนวนครั้งที่เจอ
 */
function runRipgrep(vaultRoot: string, words: string[]): Promise<RgMatchGroup[]> {
  return new Promise((resolve, reject) => {
    const args = ["--json", "--smart-case", "-F"];
    for (const word of words) args.push("-e", word);
    args.push("--type", "md", vaultRoot);

    const proc = spawn("rg", args);
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d: Buffer) => (stdout += d.toString("utf-8")));
    proc.stderr.on("data", (d: Buffer) => (stderr += d.toString("utf-8")));

    proc.on("error", (err) => reject(err));
    proc.on("close", (code) => {
      // exit code 1 = ไม่พบ match เลย (ไม่ใช่ error) ตาม ripgrep convention
      if (code !== 0 && code !== 1) {
        reject(new Error(`[ripgrep.backend] rg exit code ${code}: ${stderr}`));
        return;
      }

      const countByPath = new Map<string, number>();
      for (const line of stdout.split("\n")) {
        if (line.trim().length === 0) continue;
        let parsed: unknown;
        try {
          parsed = JSON.parse(line);
        } catch {
          continue;
        }
        const result = rgMatchEventSchema.safeParse(parsed);
        if (!result.success) continue;

        const relPath = toPosixPath(result.data.data.path.text);
        // rg คืน path แบบ "<vaultRoot>/<id>" (วัดจาก cwd) — ตัด prefix ของ vaultRoot ออก
        const id = relPath.startsWith(`${toPosixPath(vaultRoot)}/`)
          ? relPath.slice(toPosixPath(vaultRoot).length + 1)
          : relPath;

        const current = countByPath.get(id) ?? 0;
        countByPath.set(id, current + result.data.data.submatches.length);
      }

      resolve(Array.from(countByPath.entries()).map(([path, matchCount]) => ({ path, matchCount })));
    });
  });
}

function extractTitle(content: string): string {
  const firstLine = content.split("\n").find((l) => l.trim().startsWith("#"));
  return firstLine ?? "";
}

/**
 * สูตรคะแนน — ตั้งใจให้อ่านออกและคำนวณตามได้ด้วยมือ (CLAUDE.md §2.1)
 *
 * matchCount: จำนวนครั้งที่คำใน query (คำใดก็ได้) เจอในไฟล์ทั้งหมด — proxy หยาบๆ
 *   ของความเกี่ยวข้อง ไม่มี IDF จึงให้น้ำหนักคำหายากกับคำธรรมดาเท่ากัน
 * exactPhraseMatch (+5): query ทั้งประโยคปรากฏเป็น substring ต่อเนื่องในเนื้อหา
 *   ให้น้ำหนักสูงเพราะเป็นสัญญาณที่แม่นกว่าคำแยกกันมาก
 * matchInTitle (+3): มีคำจาก query ปรากฏในบรรทัดหัวข้อ (# ...) — หัวข้อมักสรุปเนื้อหาทั้งไฟล์
 *
 * ข้อจำกัดที่ตั้งใจเปิดเผย: ไม่มี normalization ตามความยาว note — note ยาวมีโอกาส
 * เจอคำซ้ำเยอะกว่าโดยไม่ได้เกี่ยวข้องมากกว่าจริง (length bias) ดู README W1-3
 */
function computeScore(matchCount: number, note: MemoryNote, queryText: string, words: string[]): number {
  const contentLower = note.content.toLowerCase();
  const exactPhraseMatch = contentLower.includes(queryText.toLowerCase());
  const titleLower = extractTitle(note.content).toLowerCase();
  const matchInTitle = words.some((w) => titleLower.includes(w.toLowerCase()));

  return matchCount + (exactPhraseMatch ? 5 : 0) + (matchInTitle ? 3 : 0);
}

export class RipgrepBackend implements SearchBackend {
  readonly name = "ripgrep";

  private readonly vaultRoot: string;
  private notesById = new Map<string, MemoryNote>();

  constructor(vaultRoot: string) {
    this.vaultRoot = vaultRoot;
  }

  /**
   * ไม่มี index ให้สร้างจริงๆ — ripgrep อ่านทุกไฟล์ทุกครั้งที่ search() เสมอ
   * ที่ยังต้องเก็บ notes ไว้ในนี้เพราะ SearchResult ต้องคืน MemoryNote เต็มรูป
   * แต่การเก็บ Map นี้ไม่ได้ช่วยให้ค้นหาเร็วขึ้นเลยแม้แต่น้อย — แค่ map path -> note
   * หลัง rg บอกมาว่าไฟล์ไหน match แล้วเท่านั้น
   */
  async index(notes: MemoryNote[]): Promise<void> {
    this.notesById = new Map(notes.map((n) => [n.id, n]));
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    await checkRgAvailable();

    const words = splitWords(query.text);
    if (words.length === 0) return [];

    const groups = await runRipgrep(this.vaultRoot, words);

    let results: SearchResult[] = [];
    for (const group of groups) {
      const note = this.notesById.get(group.path);
      if (!note) continue; // ไฟล์ที่ rg เจอแต่ไม่มีใน vault-reader (ไม่ควรเกิด แต่กันไว้)

      results.push({
        note,
        score: computeScore(group.matchCount, note, query.text, words),
        matchedBy: "keyword",
      });
    }

    if (query.layer) {
      results = results.filter((r) => r.note.layer === query.layer);
    }
    if (query.tags && query.tags.length > 0) {
      // AND semantics: note ต้องมีครบทุก tag ที่ query ระบุ ไม่ใช่แค่ตัวใดตัวหนึ่ง
      // เพราะ use case จริงคือ "แคบผลลัพธ์ลง" ไม่ใช่ "ขยายผลลัพธ์" — ผู้ใช้ที่ระบุ
      // หลาย tag พร้อมกันมักตั้งใจกรองให้แคบ ไม่ใช่ OR ที่จะขยายผลลัพธ์ออกไป
      const requiredTags = query.tags;
      results = results.filter((r) => requiredTags.every((t) => r.note.tags.includes(t)));
    }

    results.sort((a, b) => b.score - a.score);

    return query.limit ? results.slice(0, query.limit) : results;
  }

  async stats(): Promise<{ indexedCount: number; sizeBytes: number; buildTimeMs: number }> {
    // ไม่มี index จริง — sizeBytes และ buildTimeMs ต้องเป็น 0 จริงๆ ไม่ใช่เลขปลอม
    return { indexedCount: this.notesById.size, sizeBytes: 0, buildTimeMs: 0 };
  }
}
