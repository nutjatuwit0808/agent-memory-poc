import { parse as parseYaml } from "yaml";
import { z } from "zod";
import type { Layer } from "./types.js";

// ต้องตรงกับ Layer ใน types.ts ทุกตัว — แยกไว้ที่นี่เพราะ vault-reader ต้องใช้ list นี้เทียบชื่อโฟลเดอร์ด้วย
export const LAYERS = [
  "convention",
  "structure",
  "business-logic",
  "deployment",
  "support-case",
] as const satisfies readonly Layer[];

const frontmatterSchema = z.object({
  layer: z.enum(LAYERS),
  tags: z.array(z.string()).min(1, "ต้องมีอย่างน้อย 1 tag"),
  created: z.union([z.string(), z.date()]),
  links: z.array(z.string()).default([]),
});

export class FrontmatterError extends Error {
  constructor(filePath: string, reason: string) {
    super(`[frontmatter] ${filePath}: ${reason}`);
    this.name = "FrontmatterError";
  }
}

export interface ParsedNote {
  content: string;
  layer: Layer;
  tags: string[];
  createdAt: string;
  links: string[];
}

const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;

// frontmatter links เขียนเป็น "[[target]]" แต่ MemoryNote.links เก็บ target ล้วน
function stripWikilink(raw: string): string {
  const match = /^\[\[(.+)\]\]$/.exec(raw.trim());
  return match ? match[1]!.trim() : raw.trim();
}

function toIsoDate(value: string | Date, filePath: string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new FrontmatterError(
      filePath,
      `field "created" parse เป็นวันที่ไม่ได้ ค่าที่ได้รับ: ${JSON.stringify(value)}`
    );
  }
  return date.toISOString();
}

/**
 * แยก frontmatter block ด้วยมือ (ไม่ใช้ gray-matter — นี่คือกลไกที่ workshop
 * ต้องการให้เห็น) แล้ว parse YAML body ด้วย `yaml` package + validate ด้วย zod
 *
 * Pure function: รับ string + path เข้ามา ไม่อ่านไฟล์เอง (I/O อยู่ที่ vault-reader)
 */
export function parseFrontmatter(raw: string, filePath: string): ParsedNote {
  const normalized = raw.replace(/\r\n/g, "\n");

  const firstLineEnd = normalized.indexOf("\n");
  const firstLine = (firstLineEnd === -1 ? normalized : normalized.slice(0, firstLineEnd)).trim();
  if (firstLine !== "---") {
    throw new FrontmatterError(
      filePath,
      `ไม่พบ frontmatter block (ไฟล์ต้องขึ้นต้นด้วยบรรทัด "---")`
    );
  }

  const closingIndex = normalized.indexOf("\n---", firstLineEnd);
  if (closingIndex === -1) {
    throw new FrontmatterError(filePath, `frontmatter block ไม่ปิด (หา "---" ตัวที่สองไม่เจอ)`);
  }

  const yamlBlock = normalized.slice(firstLineEnd + 1, closingIndex);
  const afterClosing = normalized.slice(closingIndex + 4);
  const content = (afterClosing.startsWith("\n") ? afterClosing.slice(1) : afterClosing).trimStart();

  let parsedYaml: unknown;
  try {
    parsedYaml = parseYaml(yamlBlock) ?? {};
  } catch (err) {
    throw new FrontmatterError(filePath, `YAML parse error: ${(err as Error).message}`);
  }

  const result = frontmatterSchema.safeParse(parsedYaml);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const field = issue.path.join(".") || "(root)";
        return `field "${field}" ผิด: ${issue.message}`;
      })
      .join("; ");
    throw new FrontmatterError(filePath, issues);
  }

  const fm = result.data;
  const createdAt = toIsoDate(fm.created, filePath);
  const frontmatterLinks = fm.links.map(stripWikilink);
  const inlineLinks = [...content.matchAll(WIKILINK_RE)].map((m) => m[1]!.trim());
  const links = Array.from(new Set([...frontmatterLinks, ...inlineLinks]));

  return {
    content,
    layer: fm.layer,
    tags: fm.tags,
    createdAt,
    links,
  };
}
