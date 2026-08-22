import type { MemoryNote } from "../../core/types.js";

export interface Chunk {
  noteId: string;
  chunkIndex: number;
  heading: string;
  /** ข้อความเต็มที่จะถูก embed จริง (metadata prefix + เนื้อหา section) */
  embedText: string;
}

function extractTitle(content: string): string {
  const line = content.split("\n").find((l) => /^#\s+/.test(l));
  return line ? line.replace(/^#\s+/, "").trim() : "";
}

/**
 * แนบ layer + tags + หัวข้อแม่ (H1) + หัวข้อ section เข้าไปในทุก chunk เพราะ chunk ที่ตัด
 * กลางเรื่องจะขาด context จนหาไม่เจอถ้า embed แค่เนื้อ section เฉยๆ — metadata นี้กิน
 * โควตา token ไปด้วย (วัด % จริงใน README W3-2)
 */
function buildMetadataPrefix(note: MemoryNote, title: string, sectionHeading: string): string {
  const tagsStr = note.tags.join(", ");
  const headingPath = sectionHeading ? `${title} > ${sectionHeading}` : title;
  return `layer: ${note.layer} | tags: ${tagsStr} | หัวข้อ: ${headingPath}`;
}

/**
 * ตัด note เป็น chunk ตามหัวข้อ markdown ระดับ `## ` — เนื้อหาก่อนหัวข้อ `##` แรก
 * (คำนำใต้ H1) ถือเป็น chunk แรก ถ้า note ไม่มี `##` เลย ทั้งไฟล์เป็น 1 chunk
 */
export function chunkNote(note: MemoryNote): Chunk[] {
  const title = extractTitle(note.content);
  const lines = note.content.split("\n");

  const sections: { heading: string; bodyLines: string[] }[] = [{ heading: "", bodyLines: [] }];

  for (const line of lines) {
    const headingMatch = /^##\s+(.+)$/.exec(line);
    if (headingMatch) {
      sections.push({ heading: headingMatch[1]!.trim(), bodyLines: [] });
    } else if (!/^#\s+/.test(line)) {
      // ข้ามบรรทัด H1 (# Title) ออกจาก body เพราะเอาไปใส่ใน metadata prefix แล้ว
      sections.at(-1)!.bodyLines.push(line);
    }
  }

  const nonEmptySections = sections.filter((s) => s.bodyLines.join("").trim().length > 0);
  const effectiveSections = nonEmptySections.length > 0 ? nonEmptySections : sections;

  return effectiveSections.map((section, i) => {
    const body = section.bodyLines.join("\n").trim();
    const prefix = buildMetadataPrefix(note, title, section.heading);
    return {
      noteId: note.id,
      chunkIndex: i,
      heading: section.heading || title,
      embedText: `${prefix}\n${body}`,
    };
  });
}

/** whole-note baseline (W3-2) — ไม่ตัด chunk เลย ใช้เทียบว่า chunking ช่วยจริงไหม */
export function wholeNoteChunk(note: MemoryNote): Chunk[] {
  const title = extractTitle(note.content);
  const prefix = buildMetadataPrefix(note, title, "");
  return [{ noteId: note.id, chunkIndex: 0, heading: title, embedText: `${prefix}\n${note.content}` }];
}
