import { readdir, readFile } from "node:fs/promises";
import { join, relative, extname } from "node:path";
import { parseFrontmatter } from "./frontmatter.js";
import type { Layer, MemoryNote } from "./types.js";

// โฟลเดอร์ vault ตั้งชื่อเป็นพหูพจน์ (support-cases/) แต่ enum Layer เป็นเอกพจน์
// (support-case) — mismatch นี้ตั้งใจทิ้งไว้ใน spec แล้ว จึง map ตรงนี้แทนการแก้ enum
const FOLDER_TO_LAYER: Record<string, Layer> = {
  convention: "convention",
  structure: "structure",
  "business-logic": "business-logic",
  deployment: "deployment",
  "support-cases": "support-case",
};

export class VaultReadError extends Error {
  constructor(filePath: string, reason: string) {
    super(`[vault] ${filePath}: ${reason}`);
    this.name = "VaultReadError";
  }
}

function toPosixPath(p: string): string {
  return p.split("\\").join("/");
}

async function walkMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkMarkdownFiles(full)));
    } else if (entry.isFile() && extname(entry.name) === ".md") {
      files.push(full);
    }
  }
  return files;
}

/** I/O ทั้งหมดอยู่ในฟังก์ชันนี้ฟังก์ชันเดียว — parseFrontmatter และ vaultStats เป็น pure */
export async function readVault(vaultRoot: string): Promise<MemoryNote[]> {
  const filePaths = await walkMarkdownFiles(vaultRoot);
  const notes: MemoryNote[] = [];

  for (const filePath of filePaths) {
    const relPath = toPosixPath(relative(vaultRoot, filePath));
    const raw = await readFile(filePath, "utf-8");

    const parsed = parseFrontmatter(raw, relPath);

    const folderName = relPath.split("/")[0] ?? "";
    const expectedLayer = FOLDER_TO_LAYER[folderName];
    if (!expectedLayer) {
      throw new VaultReadError(relPath, `อยู่ในโฟลเดอร์ที่ไม่รู้จัก: "${folderName}"`);
    }
    if (parsed.layer !== expectedLayer) {
      throw new VaultReadError(
        relPath,
        `frontmatter layer="${parsed.layer}" ไม่ตรงกับโฟลเดอร์ "${folderName}" (ควรเป็น "${expectedLayer}")`
      );
    }

    notes.push({
      id: relPath,
      content: parsed.content,
      layer: parsed.layer,
      tags: parsed.tags,
      createdAt: parsed.createdAt,
      links: parsed.links,
    });
  }

  return notes;
}

export interface VaultStats {
  count: number;
  totalBytes: number;
  totalWords: number;
}

const THAI_RUN_RE = /[฀-๿]+/g;
const THAI_CHARS_PER_WORD = 4; // ค่าเฉลี่ยความยาวคำภาษาไทยโดยประมาณ ไม่ใช่ word segmentation ที่แม่นยำ

function countWords(text: string): number {
  // ภาษาไทยไม่มีช่องว่างคั่นคำ — นับ run ของอักษรไทยแยกจากส่วนที่เหลือ
  // (อังกฤษ/ตัวเลข/สัญลักษณ์) ซึ่งยังนับแบบ whitespace-split ได้ตามปกติ
  const thaiRuns = text.match(THAI_RUN_RE) ?? [];
  const thaiCharCount = thaiRuns.reduce((sum, run) => sum + run.length, 0);
  const thaiWordEstimate = Math.ceil(thaiCharCount / THAI_CHARS_PER_WORD);

  const nonThaiText = text.replace(THAI_RUN_RE, " ");
  const nonThaiWordCount = nonThaiText.split(/\s+/).filter((w) => w.length > 0).length;

  return thaiWordEstimate + nonThaiWordCount;
}

export function vaultStats(notes: MemoryNote[]): VaultStats {
  let totalBytes = 0;
  let totalWords = 0;
  for (const note of notes) {
    totalBytes += Buffer.byteLength(note.content, "utf-8");
    totalWords += countWords(note.content);
  }
  return { count: notes.length, totalBytes, totalWords };
}
