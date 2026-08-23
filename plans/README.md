# Plans — memory-workshop

ชุดแผนสำหรับ execute ทีละ phase อ่าน `CLAUDE.md` ที่ root ก่อนเสมอ แล้วค่อยเปิดไฟล์ phase ที่จะทำ

## โครงแผน

| Phase | ไฟล์ | โฟกัส | ต้องทำก่อน |
|---|---|---|---|
| 0 | [00-foundation.md](00-foundation.md) | scaffold + `core/` + vault seed + bench harness | — |
| 1 | [01-ripgrep.md](01-ripgrep.md) | search แบบไม่มี index | 0 |
| 2 | [02-fts5.md](02-fts5.md) | inverted index + staleness | 1 |
| 3 | [03-vector.md](03-vector.md) | embedding + cosine + ANN | 2 |
| 4 | [04-router.md](04-router.md) | hybrid routing + fusion | 3 |
| 5 | [05-frontend.md](05-frontend.md) | UI เปรียบเทียบ backend แบบพิมพ์ query เอง | 4 |

## ส่วนขยาย — retrieval แบบอื่นที่ยังไม่ได้ทำ (ยังไม่เริ่ม)

สี่แผนนี้มาจากการสำรวจว่าปัจจุบันมี retrieval แบบไหนอีกบ้างนอกจาก 4 แบบที่ทำไปแล้ว **เรียงตามความคุ้ม/ความเสี่ยง ไม่ใช่ตามลำดับที่ค้นเจอ**

| Phase | ไฟล์ | โฟกัส | dependency ใหม่ | ความเสี่ยงหลัก |
|---|---|---|---|---|
| 6 | [06-graph-traversal.md](06-graph-traversal.md) | เดินตาม wikilink ที่ `core/` parse ไว้แล้วแต่ไม่มีใครใช้ | **ไม่มีเลย** | ต้องเพิ่ม multi-hop query ก่อน ไม่งั้นวัดไม่เห็นอะไร |
| 7 | [07-reranking.md](07-reranking.md) | cross-encoder จัดอันดับใหม่ (2-stage) | โมเดล (ใช้ dep เดิมได้) | precision@5 อยู่ที่ 89% ของเพดานแล้ว อาจไม่มีที่ให้ปรับปรุง |
| 8 | [08-learned-sparse.md](08-learned-sparse.md) | SPLADE — sparse ที่เรียนรู้ term expansion | โมเดล | multilingual หายาก · อาจแพ้ BM25 ถ้าไม่ train เอง |
| 9 | [09-late-interaction.md](09-late-interaction.md) | ColBERT — เก็บเวกเตอร์ทุก token + MaxSim | โมเดล (ColBERT checkpoint) | index ใหญ่ขึ้น ~80 เท่า |

## ส่วนขยาย — เอาไปใช้จริงนอกโปรเจกต์ (ยังไม่เริ่ม)

| Phase | ไฟล์ | โฟกัส | dependency ใหม่ | ความเสี่ยงหลัก |
|---|---|---|---|---|
| 10 | [10-mcp-server.md](10-mcp-server.md) | ใช้ vault เป็น memory ใน Cursor ผ่าน MCP + วัดว่า overhead กลบความเร็วไหม | ไม่มี (เขียน JSON-RPC เอง) | Cursor indexing เป็นกล่องดำ — เทียบ latency ตรงๆ ไม่ได้ |

**ทำ Phase 10 แยกจาก 6–9 ได้เลย** ไม่ต้องรอ — มันใช้ backend ที่มีอยู่แล้วตั้งแต่ WS04 ไม่ได้พึ่ง retrieval แบบใหม่

**ทำไมเรียงแบบนี้:** Phase 6 ไม่ต้องเพิ่ม dependency สักตัวและใช้ของที่มีอยู่แล้ว (`note.links`) จึงคุ้มที่สุด · Phase 6 ยังเพิ่ม multi-hop query เข้า `bench/queries.json` ซึ่ง phase หลังใช้ต่อได้ · Phase 9 หนักสุดและเสี่ยงตกหลุมเดิมกับ WS03 (PQ ทำ recall พัง) จึงไว้ท้ายสุด

## นโยบาย dependency สำหรับ Workshop 06–10 (ตัดสิน 2026-08-23)

| กรณี | ต้องขออนุมัติไหม |
|---|---|
| โมเดลใหม่ที่รันผ่าน `@huggingface/transformers` ที่มีอยู่แล้ว (cross-encoder, SPLADE, ColBERT) | ❌ **อนุมัติล่วงหน้าแล้ว** — โหลดได้เลย แค่จดชื่อ + ขนาดลง README |
| `@modelcontextprotocol/sdk` (fallback ของ D-14) | ❌ **อนุมัติล่วงหน้าแล้ว** — ใช้ได้ถ้า W10-1 เขียนเองแล้วต่อไม่ติด |
| npm package อื่นนอกจากสองข้อบน | ✅ ต้องถามก่อนเสมอ (CLAUDE.md §7) |

เหตุผล: spike ของ 07/08/09 คือการ *ลองว่าโมเดลใช้กับไทยได้ไหม* ซึ่งต้องโหลดมาลองถึงจะรู้ — ถ้าต้องหยุดถามทุกครั้งจะสะดุดกลางคัน แต่ต้นทุนจริงคือพื้นที่ดิสก์ (~400–500MB/ตัว) ไม่ใช่ dependency ที่ผูกกับโค้ด

**สิ่งที่ตั้งใจไม่ทำ** — HyDE, query rewriting, multi-query fusion, agentic retrieval (Self-RAG/FLARE): ทั้งกลุ่มนี้ต้องเรียก LLM ในเส้นทางตัดสินใจ ซึ่ง**ขัด CLAUDE.md §2.1 โดยตรง** · GraphRAG แบบสกัด entity ด้วย LLM ก็ขัด §1 เช่นกัน (Phase 6 จึงใช้ wikilink ที่คนเขียนเองแทน)

สถานะทุก task อยู่ที่ [`../CHECKLIST.md`](../CHECKLIST.md) — **อัปเดตที่นั่นที่เดียว** ไฟล์แผนไม่เก็บสถานะ

## กติกาการ execute

1. ทำทีละ task ตามลำดับ ID ในไฟล์ phase
2. D-1…D-5 ตัดสินครบแล้ว (ดูตารางล่าง) — ถ้าเจอทางแยกที่แผนไม่ได้ครอบไว้ โดยเฉพาะ **เพิ่ม dependency** หรือ **ใส่ LLM call** ให้หยุดถามก่อน ห้ามเลือกเอง (CLAUDE.md §7)
3. task จะติ๊ก `[x]` ได้ต่อเมื่อผ่าน **DoD** (Definition of Done) ครบทุกข้อ
4. ตัวเลขทุกตัวใน README ของ workshop ต้องมาจากการรัน `bench` จริง ห้ามเดา

## ทำไมต้องมี Phase 0

ตาราง workshop ใน CLAUDE.md §5 เริ่มที่ 01 (ripgrep) แต่ 01 ต้องมี `MemoryNote[]` จาก `core/` และต้องมี `bench.ts` ไว้วัดผลอยู่แล้ว — Phase 0 คือส่วนที่ทุก workshop ใช้ร่วมกัน ไม่ใช่ workshop ใหม่ และตาม CLAUDE.md §2.4 **ไฟล์ที่สร้างใน Phase 0 ต้องไม่ถูกแก้อีกเลยตลอด 01→04** ถ้าต้องแก้เมื่อไหร่ = interface ออกแบบพลาด ให้ยกขึ้นมาคุยก่อน

## Decisions — ตัดสินครบแล้ว (2026-08-22)

| ID | เรื่อง | ผล |
|---|---|---|
| D-1 | runtime + TS execution | Node 22 LTS + `tsx` |
| D-2 | ripgrep binary | system `rg` + spawn |
| D-3 | SQLite driver | `better-sqlite3` |
| D-4 | embedding provider | `paraphrase-multilingual-MiniLM` ผ่าน transformers.js (local) |
| D-5 | ANN | ทำ LanceDB + corpus สังเคราะห์ ≥10k |

เหตุผลเต็มอยู่ใน [`../CHECKLIST.md`](../CHECKLIST.md) · trade-off ที่เคยชั่งน้ำหนักอยู่ในไฟล์ phase

**Dependency ที่อนุมัติแล้ว:** `tsx`, `zod`, `yaml`, `better-sqlite3`, `@huggingface/transformers`, `@lancedb/lancedb` — นอกจากนี้ต้องถามก่อน
