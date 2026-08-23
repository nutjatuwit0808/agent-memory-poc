import type { MemoryNote } from "../../core/types.js";

/** wikilink เก็บ target แบบไม่มี .md ต่อท้าย (เช่น "business-logic/refund-policy") ต่างจาก note.id ที่มี .md เสมอ */
function normalizeLinkTarget(target: string): string {
  return target.endsWith(".md") ? target : `${target}.md`;
}

export interface DanglingLink {
  from: string;
  to: string;
}

export interface GraphStats {
  noteCount: number;
  edgeCount: number; // จำนวน directed edge ทั้งหมด (ไม่ dedupe)
  avgDegree: number; // เฉลี่ยจาก undirected degree (forward + backward รวมกัน ไม่นับซ้ำ)
  maxDegree: number;
  orphanCount: number; // note ที่ไม่มีทั้ง forward link และ backlink เลย
  danglingLinks: DanglingLink[]; // link ที่ชี้ไปไฟล์ที่ไม่มีจริงในวอลต์
}

export type LinkDirection = "forward" | "backward" | "undirected";

/**
 * Adjacency list จาก note.links ที่ core/ parse ไว้แล้ว — ไม่แก้ core/ เลย (freeze ตั้งแต่ P0)
 * เก็บทั้ง forward (A ชี้ไป B) และ backward (ใครชี้มาที่ B บ้าง) แยกกัน เพราะ D-9/D-10
 * ต้องเลือกได้ว่าจะเดินทางไหนตอนขยายจาก seed — forward อย่างเดียวจะพลาด note ที่ "ถูกอ้างถึง"
 * บ่อยแต่ตัวเองไม่ได้ลิงก์ออกไปหาใคร (hub document)
 */
export class LinkGraph {
  private readonly forward = new Map<string, Set<string>>();
  private readonly backward = new Map<string, Set<string>>();
  readonly stats: GraphStats;

  constructor(notes: MemoryNote[]) {
    const noteIds = new Set(notes.map((n) => n.id));
    for (const id of noteIds) {
      this.forward.set(id, new Set());
      this.backward.set(id, new Set());
    }

    const danglingLinks: DanglingLink[] = [];
    let edgeCount = 0;

    for (const note of notes) {
      for (const rawTarget of note.links) {
        const target = normalizeLinkTarget(rawTarget);
        if (!noteIds.has(target)) {
          danglingLinks.push({ from: note.id, to: target });
          continue;
        }
        if (target === note.id) continue; // self-link ไม่มีความหมายเป็น edge

        this.forward.get(note.id)!.add(target);
        this.backward.get(target)!.add(note.id);
        edgeCount++;
      }
    }

    const degrees = notes.map((n) => this.neighbors(n.id, "undirected").size);
    const orphanCount = degrees.filter((d) => d === 0).length;

    this.stats = {
      noteCount: notes.length,
      edgeCount,
      avgDegree: notes.length === 0 ? 0 : degrees.reduce((a, b) => a + b, 0) / notes.length,
      maxDegree: degrees.length === 0 ? 0 : Math.max(...degrees),
      orphanCount,
      danglingLinks,
    };
  }

  /** เพื่อนบ้านของ note ตามทิศทางที่ระบุ — undirected รวม forward+backward แบบไม่นับซ้ำ */
  neighbors(noteId: string, direction: LinkDirection): Set<string> {
    if (direction === "forward") return this.forward.get(noteId) ?? new Set();
    if (direction === "backward") return this.backward.get(noteId) ?? new Set();

    const combined = new Set(this.forward.get(noteId) ?? []);
    for (const id of this.backward.get(noteId) ?? []) combined.add(id);
    return combined;
  }
}
