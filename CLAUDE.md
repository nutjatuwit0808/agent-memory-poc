# CLAUDE.md — memory-workshop

Context สำหรับ agent ที่มาช่วยพัฒนา workshop นี้ อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง

---

## 1. เป้าหมายของโปรเจกต์

**Case study** สำหรับเรียนรู้กลไกการจัดการ memory ของ agent ด้วยการเขียนเองทุกบรรทัด ไม่ใช่ production system และไม่ใช่ tutorial ที่มีแบบฝึกหัด

โฟกัสอยู่ที่ **การเปรียบเทียบ search backend 3 แบบบน vault เดียวกัน** เพื่อให้เห็น trade-off ด้วยตัวเลขจริง ไม่ใช่ทฤษฎี

### เกณฑ์ตัดสินใจหลัก

เมื่อต้องเลือกระหว่างสองทาง ให้ถามว่า:

> "ทางไหนทำให้ **เห็นและเข้าใจกลไก** มากกว่ากัน"

ถ้าทางที่ง่ายกว่าคือเรียก library ที่ทำให้หมดแต่มองไม่เห็นข้างใน → เลือกทางที่เขียนเอง แม้จะยาวกว่า

### สิ่งที่ตัดสินใจไปแล้ว ห้ามเสนอกลับ

| ตัวเลือก | ทำไมไม่ใช้ |
|---|---|
| **Cognee** | ทดลองแล้ว — ซ่อนกลไกไว้ใน `cognify()` ทำให้ไม่ได้เรียนรู้เรื่อง memory management เพิ่ม ขัดกับเป้าหมายโดยตรง |
| **LLM extraction** | ไม่ใช้ — กรอก field เองตอนเขียนแทนการให้ LLM extract ทีหลัง ทำให้ระบบ deterministic 100% |
| **เริ่มด้วย vector search ทันที** | ข้ามความเข้าใจพื้นฐาน ต้องไล่จาก ripgrep → FTS5 → vector ตามลำดับ |
| **Decay/fidelity logic** | ตัดออกจาก scope — เป็นเรื่องของ memory lifecycle ไม่ใช่ search comparison ถ้าอยากศึกษาต่อค่อยเปิดเป็น workshop ใหม่ทีหลัง |

---

## 2. หลักการออกแบบที่ห้ามละเมิด

### 2.1 Deterministic ownership

ทุก decision ต้องคำนวณได้ ไม่ใช่ให้ LLM ตัดสิน

- layer → เลือกเองตอนเขียน (enum บังคับ)
- ranking → สูตรที่อ่านออก (BM25 / cosine / exact match)

ถ้าเจอจุดที่อยากเรียก LLM มาตัดสินใจ → **หยุดแล้วถามก่อน** อย่าใส่เข้าไปเงียบๆ

### 2.2 Vault คือ source of truth

- เนื้อหาจริงอยู่ใน `vault/**/*.md` แก้ตรงได้ผ่าน editor ใดก็ได้
- ทุกอย่างใน `data/` เป็น derived state — ลบทิ้งแล้ว rebuild ได้เสมอ ไม่มีข้อมูลหาย

### 2.3 Backend-agnostic core

`src/core/` ต้องไม่รู้จัก ripgrep / SQLite / vector เลย

ถ้าต้อง import อะไรจาก `src/search/` เข้ามาใน `core/` → ออกแบบผิด กลับไปคิดใหม่

### 2.4 Incremental

แต่ละ workshop **เพิ่มไฟล์ ไม่รื้อของเดิม** — `core/` ต้องไม่ต้องแก้เลยตลอด Workshop 01→04 ถ้าต้องแก้ แสดงว่า interface ออกแบบไม่ดีพอ

---

## 3. Folder architecture

```
memory-workshop/
  vault/                              # source of truth
    convention/
    structure/
    business-logic/
    deployment/
    support-cases/

  src/
    core/                             # backend-agnostic
      types.ts
      frontmatter.ts
      vault-reader.ts

    search/
      backend.interface.ts
      backends/
        ripgrep.backend.ts            # Workshop 01
        fts5.backend.ts               # Workshop 02
        vector.backend.ts             # Workshop 03
      router.ts                       # Workshop 04

    cli/
      bench.ts                        # รัน query เดียวกันผ่านทุก backend
      reindex.ts                      # rebuild index (FTS5/vector)

  data/                                # derived state ลบได้เสมอ
    index.sqlite                      # Workshop 02
    vectors.lance/                    # Workshop 03

  workshops/
    01-ripgrep/README.md
    02-fts5-index/README.md
    03-vector-search/README.md
    04-hybrid-router/README.md
```

---

## 4. Core contracts

### 4.1 Types (`src/core/types.ts`)

```typescript
export type Layer =
  | "convention"
  | "structure"
  | "business-logic"
  | "deployment"
  | "support-case";

export interface MemoryNote {
  id: string;              // relative path จาก vault root
  content: string;
  layer: Layer;
  tags: string[];
  createdAt: string;       // ISO 8601
  links: string[];         // wikilink targets
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
```

### 4.2 Search backend interface

**สัญญากลางที่ทำให้ workshop ต่อกันได้ — ห้ามแก้ signature หลัง Workshop 01 เสร็จ**

```typescript
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
```

**ทุก backend index เนื้อหาทั้ง vault เสมอ** — ไม่มีการกรอง note ออกจาก index ด้วยเงื่อนไขใดๆ ผลค้นหาจากทุก backend จึงเทียบกันได้ตรงๆ บนชุดข้อมูลเดียวกัน

### 4.3 Frontmatter schema

ทุก `.md` ใน vault ต้องมี frontmatter ตามนี้ — parse ด้วย zod ถ้าไม่ผ่านให้ error ชัดเจน ไม่ใช่ปล่อยผ่านเงียบๆ

```yaml
---
layer: business-logic          # required, enum
tags: [refund, timeout]        # required, อย่างน้อย 1
created: 2026-08-16
links:
  - "[[structure/module-payment]]"
---
```

---

## 5. Workshop progression

| # | โฟกัส | เพิ่มไฟล์ | สิ่งที่ต้องได้คำตอบ |
|---|---|---|---|
| **01** | ripgrep | `ripgrep.backend.ts` | search ทำงานได้โดยไม่มี index ยังไง? latency จริงที่ vault ขนาดนี้เท่าไหร่? |
| **02** | SQLite FTS5 | `fts5.backend.ts`, `reindex.ts` | index เร็วกว่าเพราะอะไร? "index stale" คือปัญหาอะไร แก้ยังไง? |
| **03** | Vector (ANN) | `vector.backend.ts` + embedding cache | เมื่อไหร่ semantic ชนะ keyword? แลกมากับ cost/latency เท่าไหร่? |
| **04** | Hybrid router | `router.ts` | ทำไม production ไม่เลือกแค่ตัวเดียว? layer pre-filter ช่วยตรงไหน? |

### โครงของแต่ละ workshop README

1. **คำถามตั้งต้น** — workshop นี้ตอบคำถามอะไร
2. **ทฤษฎีสั้น** — ไม่เกินครึ่งหน้า อธิบายกลไกก่อนลงมือ
3. **Implementation** — โค้ดจริงทีละ step พร้อมอธิบายว่าทำไมเขียนแบบนี้
4. **ผลการวัด** — รัน `bench.ts` เทียบกับ workshop ก่อนหน้า บันทึกตัวเลขจริงลง README
5. **สรุปสิ่งที่พบ** — trade-off ที่เห็นจากตัวเลข ไม่ใช่จากทฤษฎี

---

## 6. Coding conventions

- **TypeScript** strict mode
- **ไม่ใช้ ORM** — เขียน SQL ตรงๆ ให้เห็นว่าเกิดอะไรขึ้น
- **ไม่ใช้ abstraction ที่ซ่อนกลไก** — ถ้าต้องใช้ library เลือกตัวที่บางที่สุด
- **Comment อธิบาย "ทำไม" ไม่ใช่ "ทำอะไร"**
- ฟังก์ชันใน `core/` เป็น pure function ถ้าเป็นไปได้
- ตั้งชื่อไฟล์ backend เป็น `<name>.backend.ts` เสมอ

---

## 7. สิ่งที่ agent ควรทำ / ไม่ควรทำ

### ควรทำ

- ถามก่อนถ้าไม่แน่ใจว่าควรเพิ่ม dependency ตัวไหน
- เขียนโค้ดให้อ่านง่ายกว่าเขียนให้สั้น — นี่คือ case study ไม่ใช่ production
- ชี้ trade-off ทุกครั้งที่มีทางเลือกมากกว่าหนึ่ง
- แนะนำการวัดผลจริงแทนการเดาตัวเลข

### ไม่ควรทำ

- **อย่าเสนอ framework ที่ซ่อนกลไก** (Cognee, LangChain memory, Mem0) — ตัดสินใจแล้วตามข้อ 1
- **อย่าใส่ LLM call เข้าระบบหลักโดยไม่ถาม**
- **อย่าเพิ่ม decay/fidelity logic กลับเข้ามา** — ตัดออกจาก scope แล้ว ถ้าผู้เรียนถามถึง ให้ตอบเชิงแนวคิดได้ แต่ไม่ implement จนกว่าจะสั่งเปิด workshop ใหม่
- **อย่ารื้อ `core/` เพื่อรองรับ backend ใหม่** — ถ้าจำเป็นจริง ยกขึ้นมาคุยก่อน
- **อย่าข้าม workshop** — ถ้าถามเรื่อง vector ตอนอยู่ workshop 01 ตอบได้ แต่เตือนว่ายังไม่ถึงจุดที่ควร implement
- **อย่าเขียน production-grade error handling จนบดบังกลไกหลัก** — ความชัดเจนสำคัญกว่าความทนทานใน context นี้
