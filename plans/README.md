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

## ส่วนขยาย — retrieval แบบอื่น

| Phase | ไฟล์ | โฟกัส | dependency ใหม่ | สถานะ |
|---|---|---|---|---|
| 6 | [06-graph-traversal.md](06-graph-traversal.md) | เดินตาม wikilink ที่ `core/` parse ไว้แล้วแต่ไม่มีใครใช้ | **ไม่มีเลย** | ✅ เสร็จแล้ว |
| 7 | [07-reranking.md](07-reranking.md) | cross-encoder จัดอันดับใหม่ (2-stage) | โมเดล (ใช้ dep เดิมได้) | ✅ เสร็จแล้ว |

**Phase 8 (SPLADE) และ Phase 9 (ColBERT/late interaction) ถูกถอดออกจากแผนแล้ว (2026-08-23)** — ทั้งสองต้องพึ่ง ML model เพิ่มเพื่อตัดสินใจว่าทำต่อได้ไหม (Phase 8 หา multilingual SPLADE ที่มี ONNX ใช้จริงไม่เจอ, Phase 9 หาเจอแต่ไฟล์ใหญ่ 2.1GB และมีความเสี่ยงเรื่อง ONNX output ไม่ตรง) ตัดสินใจไม่ผูกความคืบหน้าของโปรเจกต์ไว้กับการหาโมเดลเพิ่มอีก — ถ้าจะกลับมาทำในอนาคต ต้องเปิดแผนใหม่

## ส่วนขยาย — เอาไปใช้จริงนอกโปรเจกต์ (ยังไม่เริ่ม)

| Phase | ไฟล์ | โฟกัส | dependency ใหม่ | ความเสี่ยงหลัก |
|---|---|---|---|---|
| 10 | [10-mcp-server.md](10-mcp-server.md) | ใช้ vault เป็น memory ใน Cursor ผ่าน MCP + วัดว่า overhead กลบความเร็วไหม | ไม่มี (เขียน JSON-RPC เอง) | Cursor indexing เป็นกล่องดำ — เทียบ latency ตรงๆ ไม่ได้ |

**ทำ Phase 10 แยกจาก 6–7 ได้เลย** ไม่ต้องรอ — มันใช้ backend ที่มีอยู่แล้วตั้งแต่ WS04 ไม่ได้พึ่ง retrieval แบบใหม่

## นโยบาย dependency สำหรับ Workshop 06–10 (ตัดสิน 2026-08-23)

| กรณี | ต้องขออนุมัติไหม |
|---|---|
| `@modelcontextprotocol/sdk` (fallback ของ D-14) | ❌ **อนุมัติล่วงหน้าแล้ว** — ใช้ได้ถ้า W10-1 เขียนเองแล้วต่อไม่ติด |
| npm package อื่นนอกจากข้อบน | ✅ ต้องถามก่อนเสมอ (CLAUDE.md §7) |

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
