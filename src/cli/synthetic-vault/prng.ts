// Seeded PRNG แบบ mulberry32 — ไม่ใช้ Math.random() เพราะอยากได้ output ที่ reproducible
// (รัน generator ซ้ำด้วย seed เดิม ต้องได้ไฟล์ชุดเดิมทุกครั้ง ไล่ diff ได้)

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function (): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** hash string → uint32 (djb2) ใช้เป็น seed จาก domain id / slug ที่อ่านออกได้ */
export function stringSeed(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

export function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  const item = items[randInt(rng, 0, items.length - 1)];
  if (item === undefined) throw new Error("pick() จาก array ว่าง");
  return item;
}

/** สุ่มวันที่ในช่วง 2025-09-01..2026-08-20 (ก่อน "วันนี้" ของ workshop) คืนรูปแบบ YYYY-MM-DD */
export function randomDate(rng: Rng): string {
  const start = Date.UTC(2025, 8, 1); // 2025-09-01
  const end = Date.UTC(2026, 7, 20); // 2026-08-20
  const t = start + Math.floor(rng() * (end - start));
  const d = new Date(t);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
