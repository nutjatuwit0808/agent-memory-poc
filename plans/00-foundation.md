# Phase 0 — Foundation

## เป้าหมาย

สร้างของที่ทุก workshop ใช้ร่วมกัน: type contracts, vault reader, ข้อมูลจริงใน vault, และเครื่องมือวัดผล
หลังจบ phase นี้ `src/core/` ต้อง **แช่แข็ง** — Workshop 01→04 เพิ่มไฟล์ใน `src/search/` อย่างเดียว

## คำถามที่ต้องตอบได้ตอนจบ

- vault ขนาดเท่าไหร่ (จำนวน note, จำนวนคำ, ขนาดไบต์) — เป็น baseline ให้ทุกตัวเลขหลังจากนี้
- query set ที่จะใช้เทียบ backend คืออะไร และ "คำตอบที่ถูก" ของแต่ละ query คือ note ไหน

---

## P0-1 — Project scaffold

**ทำ:** `package.json`, `tsconfig.json` (strict), โครงโฟลเดอร์ตาม CLAUDE.md §3, `.gitignore`

**D-1 ✅ ตัดสินแล้ว: Node 22 LTS + `tsx`**
เหตุผล: โปรเจกต์นี้ขายที่ "ตัวเลขที่วัดได้จริง" — runtime มาตรฐานทำให้ตัวเลขสื่อความหมายกับคนอ่านมากกว่า Bun ที่เร็วเพราะ engine ตัวเอง
*(ทางที่ไม่เลือก: `node --experimental-strip-types` ผูกกับ Node ใหม่และยัง experimental · Bun ทำให้ตัวเลข bench เทียบกับโลกจริงยาก)*

**ต้องจดลง README:** Node version + OS + CPU — ตัวเลข bench ทั้งโปรเจกต์อ้างอิงเครื่องนี้

**ต้องมีใน `.gitignore`:** `node_modules/`, `data/` (derived state ตาม CLAUDE.md §2.2)

**npm scripts:** `bench`, `reindex`, `typecheck`

**Dependency:** ติดตั้งเฉพาะที่ Phase 0 ต้องใช้ — `tsx`, `zod`, `yaml`
ตัวที่อนุมัติแล้วแต่ **ยังไม่ติดตั้งตอนนี้**: `better-sqlite3` (WS02), `@huggingface/transformers` (WS03), `@lancedb/lancedb` (WS03) — ติดตั้งตอนถึง workshop นั้น เพื่อให้ `package.json` เล่าลำดับของ workshop ได้ด้วยตัวเอง
นอกเหนือจากรายการนี้ **ต้องถามก่อนเพิ่มทุกตัว** (CLAUDE.md §7)

**DoD**
- [ ] `npm run typecheck` ผ่านบนโปรเจกต์เปล่า (Node 22 + tsx)
- [ ] `tsconfig.json` เปิด `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- [ ] โครงโฟลเดอร์ตรงกับ CLAUDE.md §3 ทุกระดับ

---

## P0-2 — Type contracts

**ทำ:** `src/core/types.ts` + `src/search/backend.interface.ts` — คัดลอกจาก CLAUDE.md §4.1 และ §4.2 **ตามตัวอักษร** ห้ามเพิ่ม field เอง

**จุดที่ต้องระวัง (mismatch ที่มีอยู่แล้วใน spec):**

| ปัญหา | แก้ที่ไหน |
|---|---|
| โฟลเดอร์ชื่อ `support-cases/` แต่ enum คือ `"support-case"` | map ใน vault-reader (P0-4) ไม่แก้ enum |
| frontmatter ใช้ `created` แต่ type ใช้ `createdAt` | map ใน frontmatter parser (P0-3) |
| frontmatter `links` เป็น `"[[structure/module-payment]]"` แต่ `MemoryNote.links` คือ target ล้วน | ถอดวงเล็บใน parser (P0-3) |

**DoD**
- [ ] type ตรงกับ CLAUDE.md ทุกตัว
- [ ] `SearchBackend` อยู่ใน `src/search/` ไม่ใช่ `core/`
- [ ] `core/` ไม่ import อะไรจาก `search/` เลย (ตรวจด้วยตา + grep)

---

## P0-3 — Frontmatter parser

**ไฟล์:** `src/core/frontmatter.ts`

**ทำ:** แยก `---` block ด้วยมือ → parse YAML → validate ด้วย zod → normalize

เขียนส่วนตัดบล็อกเอง (ไม่ใช้ `gray-matter`) เพราะมันคือกลไกที่ workshop นี้ต้องการให้เห็น ส่วน YAML body ใช้ `yaml` package ได้ — การเขียน YAML parser เองไม่ได้สอนอะไรเรื่อง memory

**Normalize ที่ต้องทำ:** `created` → `createdAt` (ISO 8601), `[[x]]` → `x`, ดึง inline wikilink จาก body มารวมกับ `links` แล้ว dedupe

**Error ต้องบอก:** path ไฟล์ + field ที่ผิด + ค่าที่ได้รับจริง — ตาม CLAUDE.md §4.3 ห้ามปล่อยผ่านเงียบ

**DoD**
- [ ] frontmatter ถูกต้อง → ได้ object ครบทุก field
- [ ] `layer` ไม่อยู่ใน enum → error ระบุ path + ค่าที่ผิด
- [ ] `tags: []` → error (spec บังคับอย่างน้อย 1)
- [ ] ไม่มี `---` block เลย → error ไม่ใช่ return null เงียบๆ
- [ ] เป็น pure function (รับ string + path, ไม่อ่านไฟล์เอง)

---

## P0-4 — Vault reader

**ไฟล์:** `src/core/vault-reader.ts`

**ทำ:** เดิน `vault/**/*.md` → อ่านไฟล์ → เรียก frontmatter parser → คืน `MemoryNote[]`

- `id` = relative path จาก vault root ใช้ `/` เสมอ (**Windows: ต้อง normalize `\` → `/`** ไม่งั้น id เพี้ยนข้ามเครื่อง)
- ตรวจว่า `layer` ใน frontmatter ตรงกับโฟลเดอร์ที่ไฟล์อยู่ ถ้าไม่ตรง → error
- I/O อยู่ในฟังก์ชันเดียว ที่เหลือ pure

**DoD**
- [ ] อ่าน vault ทั้งหมดได้ ไม่มี error
- [ ] `id` ใช้ `/` บน Windows
- [ ] ไฟล์เสีย 1 ไฟล์ → error บอกว่าไฟล์ไหน ไม่ใช่ crash แบบไม่รู้ที่มา
- [ ] มี `vaultStats()` คืน count / totalBytes / totalWords

---

## P0-5 — Vault seed content

**ทำ:** เขียน note จริง **40–60 ไฟล์** กระจาย 5 layer ตาม CLAUDE.md §3

vault เล็กเกินไปจะทำให้ทุก backend เร็วเท่ากันหมดจนไม่เห็น trade-off — 40+ note คือขั้นต่ำที่ทำให้ตัวเลขต่างกันพอมองเห็น

**สัดส่วนที่แนะนำ:** convention 8 / structure 12 / business-logic 15 / deployment 8 / support-cases 12

**ต้องจงใจใส่เคสเหล่านี้เข้าไป** เพราะเป็นตัวที่ทำให้ backend ต่างกันในภายหลัง:

| เคส | ทำไมต้องมี |
|---|---|
| คำเดียวกันคนละความหมายข้าม layer (เช่น "timeout" ใน deployment vs business-logic) | ทดสอบ layer pre-filter (WS04) |
| เรื่องเดียวกันเขียนคนละคำ (เช่น "คืนเงิน" / "refund" / "ยกเลิกรายการ") | ทดสอบ semantic (WS03) — keyword จะแพ้ตรงนี้ |
| note ยาว >2000 คำ อย่างน้อย 3 ไฟล์ | ทดสอบ chunking (WS03) |
| ชื่อ identifier ตรงตัว (function name, env var) | keyword จะชนะ vector ตรงนี้ |
| wikilink เชื่อมข้าม layer | ใช้ตอนวิเคราะห์ผล |

**DoD**
- [ ] ≥40 ไฟล์ ผ่าน vault-reader ทั้งหมดโดยไม่มี error
- [ ] ครบทั้ง 5 layer ตามสัดส่วน
- [ ] มีเคสทั้ง 5 แบบในตารางข้างบน จดไว้ว่าไฟล์ไหนคือเคสไหน
- [ ] เนื้อหาอ่านรู้เรื่อง ไม่ใช่ lorem ipsum (ไม่งั้นตัดสิน relevance ไม่ได้)

---

## P0-6 — Query set + ground truth

**ไฟล์:** `bench/queries.json`

**ทำ:** query 15–20 ข้อ พร้อมระบุ note id ที่ถือว่า "ตอบถูก"

ถ้าวัดแค่ latency จะสรุปได้แค่ "ใครเร็ว" ซึ่งตอบไม่ได้ว่าเมื่อไหร่ควรใช้ตัวไหน — ต้องมี ground truth ถึงจะวัด recall/precision ได้

```jsonc
{
  "id": "q-refund-timeout",
  "text": "ลูกค้าขอคืนเงินแล้วระบบค้าง",
  "kind": "semantic",        // exact | keyword | semantic | filtered
  "layer": null,             // ใส่เมื่อ kind = filtered
  "relevant": ["business-logic/refund-policy.md", "support-cases/case-2891.md"]
}
```

**ต้องมีครบทุก `kind`** อย่างน้อย 4 ข้อต่อ kind — ไม่งั้น bench จะเอนเข้าข้าง backend ใดตัวหนึ่งโดยไม่ตั้งใจ

**DoD**
- [ ] 15–20 query ครบทั้ง 4 kind
- [ ] ทุก `relevant` id มีอยู่จริงใน vault (เขียน validator เช็ค)
- [ ] ground truth ตัดสินด้วยคนอ่านเอง ไม่ใช่ให้ backend ตัวใดตัวหนึ่ง generate ให้

---

## P0-7 — Bench harness

**ไฟล์:** `src/cli/bench.ts`

**ทำ:** รัน query set เดียวกันผ่านทุก backend ที่ register ไว้ แล้วพิมพ์ตาราง markdown ที่ก๊อปไปแปะ README ได้เลย

**ต้องวัด:**

| กลุ่ม | metric |
|---|---|
| ความเร็ว | p50 / p95 latency ต่อ query (warmup 3 + วัด 20 รอบ) |
| คุณภาพ | recall@5, precision@5, MRR เทียบ ground truth |
| ต้นทุน | `stats()`: indexedCount, sizeBytes, buildTimeMs |

รายงาน p50/p95 ไม่ใช่ค่าเฉลี่ย — ค่าเฉลี่ยถูก outlier ตัวเดียวลากจนอ่านผิดได้

**DoD**
- [ ] `npm run bench` รันได้ (ตอนนี้ยังไม่มี backend → ตารางว่าง ไม่ crash)
- [ ] รับ flag `--backend=<name>` เลือกรันตัวเดียวได้
- [ ] output เป็น markdown table
- [ ] เขียน raw result ลง `data/bench-<timestamp>.json` ไว้ย้อนดู
- [ ] พิมพ์ vault stats ทุกครั้งที่รัน (บริบทของตัวเลข)
