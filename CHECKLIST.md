# CHECKLIST — memory-workshop

ไฟล์นี้คือ **แหล่งเดียว** ที่บอกสถานะงาน แผนละเอียดอยู่ใน [`plans/`](plans/README.md)

**Legend:** `[ ]` ยังไม่เริ่ม · `[~]` กำลังทำ · `[x]` เสร็จ (ผ่าน DoD ครบ) · `[!]` ติด รอตัดสินใจ/รอ input

**กติกา:** ติ๊ก `[x]` ได้ต่อเมื่อผ่าน DoD ทุกข้อในไฟล์แผน — ห้ามติ๊กเพราะ "เขียนโค้ดเสร็จแล้ว"

ความคืบหน้า: **36 / 36** ✅ ครบทุก workshop (Phase 0 + Workshop 01–05)

---

## Phase 0 — Foundation → [แผน](plans/00-foundation.md)

> ห้ามเริ่ม Workshop 01 ก่อน Phase 0 เสร็จครบ

- [x] **P0-1** Project scaffold — package.json, tsconfig strict, โครงโฟลเดอร์, .gitignore `Node 22 + tsx`
- [x] **P0-2** Type contracts — `core/types.ts`, `search/backend.interface.ts`
- [x] **P0-3** Frontmatter parser — split + zod + normalize (`created`→`createdAt`, ถอด `[[ ]]`)
- [x] **P0-4** Vault reader — เดินไฟล์, map folder→layer, normalize path บน Windows
- [x] **P0-5** Vault seed — 40–60 note ครบ 5 layer + เคสทดสอบ 5 แบบ
- [x] **P0-6** Query set + ground truth — `bench/queries.json` 15–20 query ครบ 4 kind
- [x] **P0-7** Bench harness — `cli/bench.ts` p50/p95 + recall/precision/MRR

**Gate:** `npm run bench` รันได้ ✅ (55 notes, 0 backend ยังไม่ crash), vault stats ออกมาแล้ว ✅, `core/` พร้อมแช่แข็ง ✅

**หมายเหตุ environment (ตัดสินใจร่วมกับผู้ใช้ 2026-08-22):**
- เครื่องนี้มี Node 26.2.0 ติดตั้งอยู่แล้ว ไม่มี nvm/fnm/volta — ผู้ใช้เลือกใช้ Node 26 ตามที่มีแทน Node 22 LTS ตาม D-1 เดิม (README ของแต่ละ workshop ต้องระบุ Node 26.2.0 เป็น runtime จริงที่ใช้วัด ไม่ใช่ 22 LTS)
- ripgrep ไม่มีในเครื่อง ติดตั้งผ่าน `winget install BurntSushi.ripgrep.MSVC` แล้ว (rg 14.1.1) ตาม D-2
- เพิ่ม `@types/node` เป็น devDependency (ไม่อยู่ใน list เดิม) เพราะ `vault-reader.ts` ต้องใช้ Node built-in types — ผู้ใช้อนุมัติแล้ว
- `vaultStats()` word count ใช้ heuristic แยกสำหรับอักษรไทย (นับ run ของอักษรไทย ÷ 4 ตัวอักษร/คำ) เพราะ whitespace-split ธรรมดานับคำไทยผิดพลาดมาก — ผู้ใช้อนุมัติแนวทางนี้แทนการนับแบบ whitespace ล้วน
- เอกสาร mapping ว่าไฟล์ไหนคือเคสทดสอบไหน (5 เคสใน P0-5) บันทึกไว้ที่ [`bench/vault-cases.md`](bench/vault-cases.md)

---

## Workshop 01 — ripgrep → [แผน](plans/01-ripgrep.md)

- [x] **W1-1** Spike ripgrep availability + JSON output shape `system rg`
- [x] **W1-2** `ripgrep.backend.ts` — index() no-op, spawn rg, parse JSON
- [x] **W1-3** Scoring — สูตรอ่านออก + โชว์ length bias
- [x] **W1-4** Filter layer/tags แบบ post-filter + พิสูจน์ด้วย latency
- [x] **W1-5** วัดผล — bench + latency vs corpus size
- [x] **W1-6** README `workshops/01-ripgrep/`

**Gate:** ตอบได้ว่า ripgrep แพ้ตรงไหน ด้วยตัวเลขจริง ✅ — recall@5 พังที่ query kind `semantic` (0.07) เทียบกับ `exact`/`keyword`/`filtered` (≥0.90) ดู [workshops/01-ripgrep/README.md](workshops/01-ripgrep/README.md)

**หมายเหตุ environment เพิ่มเติม:** `node:child_process.spawn` แบบไม่ใช้ shell หา `rg` ไม่เจอแม้ `winget install` แล้ว เพราะ PATH ของ process ที่รันอยู่ก่อนหน้าไม่ refresh อัตโนมัติ ต้องเติม path ของ rg.exe เข้า PATH ของ session ก่อนถึงจะรันได้ — เป็น environment quirk ของเครื่องนี้ ไม่ใช่บั๊กในโค้ด backend (โค้ด backend เองไม่มีปัญหาอะไร ใครมี `rg` อยู่ใน PATH ปกติจะรันได้ทันที)

---

## Workshop 02 — SQLite FTS5 → [แผน](plans/02-fts5.md)

- [x] **W2-1** Spike ยืนยัน FTS5 ใน compile options ของ better-sqlite3 `better-sqlite3`
- [x] **W2-2** Schema — notes / note_tags / fts5 external content + trigger
- [x] **W2-3** `cli/reindex.ts` — full + incremental ด้วย content hash
- [x] **W2-4** `fts5.backend.ts` — MATCH + bm25() + pre-filter ใน SQL
- [x] **W2-5** Stale index demo + stale detection
- [x] **W2-6** วัดผล + README (ต้องมี break-even point)

**Gate:** อธิบายด้วยตัวเลขได้ว่า index คุ้มเมื่อไหร่ และ stale คือราคาอะไร ✅ — break-even ≈ 0.67 query (index จ่ายคืนตัวเองก่อนยิง query แรกจบด้วยซ้ำ), stale = ต้องดูแล sync เอง (ไม่มี mechanism อัตโนมัติ) ดู [workshops/02-fts5-index/README.md](workshops/02-fts5-index/README.md)

---

## Workshop 03 — Vector → [แผน](plans/03-vector.md)

- [x] **W3-1** ตั้ง embedding pipeline `paraphrase-multilingual-MiniLM ผ่าน transformers.js`
- [x] **W3-2** Chunking — เทียบ whole-note vs chunked
- [x] **W3-3** Embedding cache — key มี model name
- [x] **W3-4** `vector.backend.ts` — cosine เขียนเอง, แยก embedQueryMs/searchMs
- [x] **W3-5** ANN (LanceDB) + corpus สังเคราะห์ ≥10k — หาจุดตัดกับ brute-force
- [x] **W3-6** วัดผล + README (ต้องมีทั้งเคสที่ชนะและเคสที่แพ้)

**Gate:** ชี้เคสจริงได้ว่า semantic ชนะที่ไหน แพ้ที่ไหน ✅ — ชนะที่ `semantic` (recall 0.07→0.67), แพ้ที่ `exact`/identifier ตรงตัว (recall 1.00→0.47) ดู [workshops/03-vector-search/README.md](workshops/03-vector-search/README.md)

**หมายเหตุสำคัญจาก Workshop 03:**
- `pipeline("feature-extraction", ...)` ของ `@huggingface/transformers` ไม่ forward `max_length`/`truncation` จริง (ทดสอบแล้วพิสูจน์) — เปลี่ยนไปเรียก `AutoTokenizer`+`AutoModel` ตรงๆ ใน `embedder.ts` แทน
- LanceDB `createIndex()` default คือ `IVF_PQ` (lossy) — recall@10 เหลือแค่ 0.20–0.33 ที่ 10k–100k, สลับเป็น `IVF_FLAT` (ไม่มี PQ) แล้ว recall กลับมา 0.98–1.00 พร้อมยังเร็วกว่า brute-force
- ติดตั้ง `@huggingface/transformers` และ `@lancedb/lancedb` มี transitive vulnerability สูง 4-5 รายการ (adm-zip ZIP-bomb, sharp/libvips CVE) จาก `onnxruntime-node`/`sharp` — ไม่มี fix ต้นน้ำ แต่ไม่เกี่ยวกับการใช้งานจริงของโปรเจกต์นี้ (ไม่ประมวลผล ZIP/รูปภาพจากแหล่งที่ไม่น่าเชื่อถือ)
- `data/models/` (465MB) และ `data/embeddings.sqlite` เป็น derived state อยู่ใน `.gitignore` แล้ว

---

## Workshop 04 — Hybrid router → [แผน](plans/04-router.md)

- [x] **W4-1** Query classifier — กฎ deterministic, มี `routedBy`
- [x] **W4-2** Layer pre-filter — วัดผลแยกทั้ง 3 backend
- [x] **W4-3** Fusion RRF + ตัวอย่างคำนวณทีละขั้น
- [x] **W4-4** Bench รวม — ตารางสรุป 5 แถวเต็มทุกช่อง
- [x] **W4-5** README + root README + ยืนยัน `core/` ไม่ถูกแก้

**Gate:** ตอบได้ว่า router คุ้มความซับซ้อนไหม ด้วยตัวเลข ✅ — route: recall +11.5% แลก latency +0.13ms เท่านั้น (คุ้มชัดเจน), fuse: recall +18% แต่แพงกว่า route 209 เท่า (คุ้มเฉพาะงานที่ไม่ sensitive latency) ดู [workshops/04-hybrid-router/README.md](workshops/04-hybrid-router/README.md)

**หมายเหตุสำคัญจาก Workshop 04:**
- เจอปัญหา whitespace word-count กับข้อความไทยอีกครั้ง (ครั้งที่ 3 ของโปรเจกต์ ต่อจาก `vault-reader.ts` และ FTS5 tokenizer) ใน query classifier — unit test จับได้ทันที แก้ด้วย heuristic เดียวกับ P0
- `core/` ยืนยันไม่ถูกแก้เลยตั้งแต่ Phase 0 จนจบ Workshop 04 (เช็ค mtime ของทั้ง 3 ไฟล์ใน `src/core/` คงที่ตลอด — ไม่มี git ในโปรเจกต์นี้จึงใช้ file timestamp แทน git log)
- ไม่มี test framework ใหม่ถูกเพิ่ม — ใช้ Node built-in `node:test` + `node:assert` (ไม่ต้องขอ dependency เพิ่ม)

---

## Workshop 05 — Frontend comparison UI → [แผน](plans/05-frontend.md)

> ✅ **D-6/D-7/D-8 อนุมัติแล้ว (2026-08-22):** Next.js + React (แยก `package.json` ใน `web/`) · แยก process ผ่าน HTTP · CSS ธรรมดา
> workshop นี้อยู่นอก scope เดิมของโปรเจกต์ (search backend comparison) — เป็น visualization layer ไม่ใช่กลไก memory
> **เส้นที่ห้ามข้าม:** `web/` ห้าม import อะไรจาก `src/` ยกเว้น type — ทุกการค้นหาต้องผ่าน HTTP

- [x] **W5-1** Search server `src/cli/serve.ts` — node:http, warm-up, engineMs แยกจาก round-trip
- [x] **W5-2** Next.js scaffold ใน `web/` — แยก package.json ไม่ปนกับ root
- [x] **W5-3** หน้าเปรียบเทียบ 5 คอลัมน์ + ไฮไลต์ผลที่ไม่ซ้ำกัน
- [x] **W5-4** Ground truth overlay — preset 20 query + recall@5 สด
- [x] **W5-5** Filter panel + router explainer (routedBy + ตาราง RRF)
- [x] **W5-6** README + ยืนยันว่า `src/` เดิมไม่ถูกแก้ และ `web/` ไม่มี logic ค้นหา

**Gate:** ตอบได้ว่า UI ทำให้เข้าใจอะไรที่ตาราง bench ไม่ได้บอก ✅ — (1) "ไม่พบผลลัพธ์เลย" ต่างจาก "recall 0.07" คนละเรื่องเมื่อเห็นบนจอ (2) แถบเหลืองเผยว่าตอน vector แพ้ มันไปเจอของผิดมาอย่างมั่นใจ ไม่ใช่แค่หาไม่เจอ (3) overhead คงที่ 15ms กลบความเร็ว 87 เท่าของ fts5 ให้เหลือ 3.2 เท่า ดู [workshops/05-frontend/README.md](workshops/05-frontend/README.md)

**หมายเหตุจาก Workshop 05:**
- เพิ่มเข้า `src/` แค่ 2 อย่าง ทั้งคู่ additive: ไฟล์ใหม่ `cli/serve.ts` และ `router.ts` เพิ่ม `fuseRRFWithBreakdown()`/`getLastFusion()` โดย **`fuseRRF()` signature ไม่เปลี่ยน** และ unit test เดิม 11 ตัวยังผ่านครบ
- ยืนยันขอบเขตด้วย grep: `web/` ไม่ import อะไรจาก `src/`, ไม่มี `.sort()`, ไม่มีการคำนวณคะแนน — ที่ grep เจอคำว่า bm25/RRF ล้วนเป็นคอมเมนต์กับข้อความอธิบายบนหน้าจอ ส่วนตัวเลขมาจาก server ทั้งหมด
- `recall@5` คำนวณฝั่ง server ด้วยสูตรเดียวกับ `bench.ts` (ตั้งใจไม่ให้ UI คำนวณเอง เพราะถ้าเพี้ยนกันแม้นิดเดียวตัวเลขจะไม่ตรงกับ README ของ workshop ก่อนหน้า)
- `next dev` v16 สร้าง `AGENTS.md`/`CLAUDE.md` ใน `web/` อัตโนมัติ — ปิดด้วย `agentRules: false` เพราะชนกับคอนเวนชันที่ `CLAUDE.md` ที่ root คือสัญญาการออกแบบตัวจริง

---

## Decisions — ตัดสินครบแล้ว (2026-08-22)

| ID | เรื่อง | ผลที่เลือก | เหตุผล |
|---|---|---|---|
| D-1 | runtime + TS execution | ✅ **Node 22 LTS + tsx** | ตัวเลข bench บน runtime มาตรฐานสื่อความหมายกับคนอ่านได้ตรงกว่า |
| D-2 | ripgrep binary | ✅ **system `rg` + spawn** | zero dep และเห็นชัดว่า search คือการยิง subprocess จริง |
| D-3 | SQLite driver | ✅ **better-sqlite3** | FTS5 มาแน่นอน + API sync ทำให้โค้ดอ่านเป็นลำดับขั้น |
| D-4 | embedding provider | ✅ **paraphrase-multilingual-MiniLM** (transformers.js) | offline + ทำซ้ำได้ 100% และรองรับไทย |
| D-5 | ANN library | ✅ **ทำ LanceDB + corpus สังเคราะห์ ≥10k** | ที่ 50 note จะได้ข้อสรุปผิดว่า "ANN ช้ากว่า" |

**ผลที่ตามมา:** dependency ที่อนุมัติแล้ว — `tsx`, `zod`, `yaml`, `better-sqlite3`, `@huggingface/transformers`, `@lancedb/lancedb`
นอกจากนี้ต้องถามก่อนเพิ่มทุกตัว (CLAUDE.md §7)

**ตัดสินแล้ว (พร้อมตัวเลขประกอบ):**
- W3-2 chunking: **chunked ชนะ whole-note** (recall@5 0.783 vs 0.725) — ดู [workshops/03-vector-search/README.md](workshops/03-vector-search/README.md)
- W3-2 score รวมระดับ note: **max** (recall@5 0.783 vs mean 0.683) — เหตุผลเต็มในไฟล์เดียวกัน
- W1-4 tags filter: **AND** — ระบุไว้ชัดเจนใน [plans/01-ripgrep.md](plans/01-ripgrep.md) W1-4 DoD อยู่แล้ว เหตุผลเต็มอยู่ที่ [workshops/01-ripgrep/README.md](workshops/01-ripgrep/README.md)

---

## Invariants — เช็คทุกครั้งที่จบ workshop

- [x] `core/` ไม่ import อะไรจาก `search/` (CLAUDE.md §2.3) — ยืนยันด้วย grep, ไม่พบเลย
- [x] `core/` ไม่ถูกแก้หลัง Phase 0 (CLAUDE.md §2.4) — ยืนยันด้วย file mtime ของทั้ง 3 ไฟล์ใน `src/core/` (ไม่มี git ในโปรเจกต์นี้)
- [x] ลบ `data/` ทั้งโฟลเดอร์แล้ว rebuild ได้ ไม่มีข้อมูลหาย (CLAUDE.md §2.2) — ทดสอบจริงตอนจบ WS04 (`data/index.sqlite`, `data/embeddings.sqlite` ลบแล้ว `npm run reindex -- --full` + `npm run bench` รันผ่านปกติ)
- [x] ไม่มี LLM call ใน decision path ใดๆ นอกจาก embedding ที่อนุมัติแล้ว (CLAUDE.md §2.1) — query classifier เป็น regex/นับคำล้วนๆ, RRF เป็นสูตรคณิตศาสตร์
- [x] `SearchBackend` signature ไม่เปลี่ยนตั้งแต่จบ WS01 (CLAUDE.md §4.2) — ยืนยันด้วยการอ่าน `backend.interface.ts` ตรงๆ
- [x] ทุก backend index ทั้ง vault ไม่มีการกรอง note ออก (CLAUDE.md §4.2) — ทุก backend รับ `notes: MemoryNote[]` เต็มจาก `readVault()` ไม่มีการ filter ก่อน index
- [x] ตัวเลขใน README ทุกตัวมาจากการรันจริง — ทุก README มีคำสั่งที่รันได้จริงกำกับ (`npm run bench`, `npm run reindex`, สคริปต์ทดลองเฉพาะกิจที่ลบทิ้งหลังบันทึกผลแล้ว)
