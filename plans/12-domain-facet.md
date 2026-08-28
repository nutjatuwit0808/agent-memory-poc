# ส่วนขยาย — เพิ่ม domain facet เข้า metadata schema

## คำถามตั้งต้น

- vector recall ตกหนักที่ scale 1,945 ไฟล์ (0.78→0.53) เพราะเนื้อหา `convention`/`deployment` ของ 30 synthetic domain ถูกสร้างจาก template เดียวกัน ทำให้ cosine similarity ข้าม domain สูงถึง 0.77-0.89 (วัดจริงแล้ว เทียบกับ baseline "เนื้อหาไม่เกี่ยวกันจริง" ที่ ~0.42) — ถ้าตัด candidate pool ด้วย domain ก่อนคำนวณ cosine จะกู้ recall กลับมาได้จริงไหม
- โครงสร้าง vault ปัจจุบันมี domain อยู่ใน **path** อยู่แล้ว (`vault/<layer>/synthetic-<domain>/file.md`) แต่ไม่มี backend ไหนดึงมาใช้เป็น queryable field เลย จะดึงออกมาใช้ยังไงให้กระทบของเดิมน้อยที่สุด

## บริบท

อ้างอิงจากบทสนทนาที่วัด cosine similarity จริง:
- convention จริง (PayFlow) vs convention สังเคราะห์ (warehouse-robotics): 0.7663
- convention สังเคราะห์ domain A vs domain B (คนละโดเมนเลย): 0.8872 (สูงสุด)
- incident จริง vs incident สังเคราะห์ (เนื้อหาต่างกันจริง): 0.4265 (baseline)

`vault-reader.ts` ปัจจุบันอ่านแค่ `relPath.split("/")[0]` (segment แรก = layer) มาเช็คกับ frontmatter `layer` — segment ที่สอง (`synthetic-<domain>`) ถูกทิ้งไปเลย เก็บไว้แค่เป็นส่วนหนึ่งของ `id` string ที่ไม่มี backend ไหนแยกอ่านออกมาใช้

## Decision points (ตัดสินแล้วระหว่างคุย)

| เรื่อง | ทางที่เลือก | เหตุผล |
|---|---|---|
| **เพิ่ม field ใน `core/types.ts` หรือเข้ารหัสเป็น tag convention** | ✅ **เพิ่ม field ใหม่ตรงๆ** (`domain: string` ใน `MemoryNote`, `domain?: string` ใน `SearchQuery`) | type-safe ชัดเจน — ยอมรับว่าเป็นการแก้ `core/` ครั้งแรกหลัง Phase 0 (ทำลาย invariant ที่ CHECKLIST.md เช็คมาตลอด) แต่เป็นการแก้แบบ **additive** (เพิ่ม field ใหม่ ไม่เปลี่ยน field เดิม) ไม่ใช่ breaking change — ต้องบันทึกเหตุผลไว้ใน invariants section ของ CHECKLIST.md ตอน execute |
| **ที่มาของค่า `domain`** | ✅ **parse จาก path ใน `vault-reader.ts`** ไม่ใช่ frontmatter ใหม่ | ไม่ต้องแก้ `build.ts` หรือ regenerate 1,890 ไฟล์เลย — ข้อมูลมีอยู่แล้วในโครงสร้างปัจจุบัน แค่ไม่เคยถูกดึงออกมาใช้ |
| **`domain` เป็น optional หรือ required ใน `MemoryNote`** | ✅ **required เสมอ (`string` ไม่ใช่ `string \| undefined`)** | ไฟล์ PayFlow (ไม่มี subfolder) ได้ `domain: "core"` เป็นค่าคงที่ ไม่ใช่ `undefined` — เหตุผล: ถ้าเป็น `undefined` จะ filter แบบ "เอาเฉพาะ PayFlow" ไม่ได้เลย (undefined มักถูกตีความว่า "ไม่ระบุ = ไม่ filter" ไม่ใช่ "ค่าเฉพาะที่ต้อง match") — ส่วน `SearchQuery.domain` ยัง optional ปกติ (ไม่ระบุ = ไม่ filter, เห็นทุก domain) |

## Rule การ derive `domain` จาก path

```
"business-logic/synthetic-ad-bidding/bid-timeout-policy.md"
  → segment[1] = "synthetic-ad-bidding" ขึ้นต้นด้วย "synthetic-" → domain = "ad-bidding" (ตัด prefix ออก)

"business-logic/customer-tier-benefits.md"
  → ไม่มี segment[1] เป็น subfolder (segment[1] คือชื่อไฟล์เอง) → domain = "core"
```

## Task breakdown

- [ ] **T1** เพิ่ม `domain: string` เข้า `MemoryNote` และ `domain?: string` เข้า `SearchQuery` ใน `core/types.ts` — DoD: `npx tsc --noEmit` ผ่าน (ทุกที่ที่ construct `MemoryNote` ต้องส่ง `domain` มาด้วย compiler จะบังคับเอง)
- [ ] **T2** แก้ `vault-reader.ts` ให้ derive `domain` ตาม rule ข้างบน — DoD: unit test ครอบคลุม 3 กรณี (ไฟล์ PayFlow ไม่มี subfolder → `"core"`, ไฟล์ synthetic → ตัด prefix ถูกต้อง, path ที่มี subfolder แต่ไม่ขึ้นต้นด้วย `synthetic-` → error หรือ fallback ตามที่ตัดสินใจตอนเขียน)
- [ ] **T3** แก้ backend ที่รองรับ filter อยู่แล้ว (`vector.backend.ts`, `fts5.backend.ts`, `ripgrep.backend.ts` ถ้ามี logic filter, `router.ts`) เพิ่มเงื่อนไข `if (query.domain && note.domain !== query.domain) return false;` ข้าง `layer`/`tags` เดิม — DoD: unit test ยืนยันว่า query ที่ไม่ระบุ `domain` เห็นผลเหมือนเดิมทุกประการ (regression) และ query ที่ระบุ `domain` กรองถูกต้อง
- [ ] **T4** แก้ `src/cli/mcp.ts` เพิ่ม parameter `domain` ให้ tool `search_memory` (pattern เดียวกับ `layer` ที่มีอยู่แล้ว) — DoD: ทดสอบผ่าน JSON-RPC ตรงๆ ทั้งกรณีระบุ/ไม่ระบุ `domain`
- [ ] **T5** อัปเดต invariants section ใน `CHECKLIST.md` — บันทึกว่า `core/` ถูกแก้ครั้งแรกหลัง Phase 0 พร้อมเหตุผล (ไม่ใช่พลาด แต่เป็นการตัดสินใจที่คุยกับผู้ใช้แล้วผ่าน `plans/12-domain-facet.md`)
- [ ] **T6** แก้ `router.test.ts` — เพิ่ม `domain` เข้า `MemoryNote` fixture ทุกตัวที่ test สร้างเอง (compile จะพังทันทีถ้าไม่แก้ เพราะ `domain` เป็น required field) — DoD: `npm run test` ผ่านครบเหมือนเดิม
- [ ] **T7** FTS5 schema migration — เพิ่มคอลัมน์ `domain TEXT NOT NULL` เข้า `notes` table ใน `schema.sql`, แก้ `INSERT`/`UPDATE` statement ใน `reindex-core.ts` ให้ใส่ค่า `domain`, แก้ `fts5.backend.ts` ให้ filter ด้วย `WHERE domain = ?` ใน SQL ตรงๆ (ไม่ใช่ filter ในหน่วยความจำแบบ vector) — DoD: `npm run reindex -- --full` รันผ่าน (schema เปลี่ยน ต้อง full reindex ไม่ใช่ incremental) แล้ว query ที่ระบุ `domain` กรองถูกต้อง
- [ ] **T8** เพิ่ม `domain` เป็น query param ใน `serve.ts` (pattern เดียวกับ `layer`/`tags` ที่มีอยู่แล้ว บรรทัด ~153-161) และเพิ่มช่อง filter ใน `web/app/page.tsx` (filter panel ที่มีอยู่แล้วจาก W5-5) — DoD: ยิง `GET /api/search?...&domain=core` ผ่าน `curl` ได้ผลถูกต้อง และ UI มีช่องให้เลือก domain

## Gate

ตอบได้ว่า:
1. domain filter ทำงานถูกต้อง (unit test ผ่านครบ)
2. query ที่ไม่ระบุ `domain` ให้ผลลัพธ์เหมือนเดิมทุกประการ (ไม่มี regression ต่อ 25 query เดิมใน `bench/queries.json`)
3. `npm run bench` ยังรันผ่านปกติที่ vault 1,945 ไฟล์ (ไม่ crash เพราะ `domain` เป็น required field ที่ทุก note ต้องมี)
