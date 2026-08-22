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
