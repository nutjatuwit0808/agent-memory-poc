# CHECKLIST — memory-workshop

ไฟล์นี้คือ **แหล่งเดียว** ที่บอกสถานะงาน แผนละเอียดอยู่ใน [`plans/`](plans/README.md)

**Legend:** `[ ]` ยังไม่เริ่ม · `[~]` กำลังทำ · `[x]` เสร็จ (ผ่าน DoD ครบ) · `[!]` ติด รอตัดสินใจ/รอ input

**กติกา:** ติ๊ก `[x]` ได้ต่อเมื่อผ่าน DoD ทุกข้อในไฟล์แผน — ห้ามติ๊กเพราะ "เขียนโค้ดเสร็จแล้ว"

ความคืบหน้า: **57 / 59** — Phase 0 + Workshop 01–07 เสร็จครบ ✅ · Workshop 08–09 ถอดออกจากแผนแล้ว (ต้องพึ่ง ML model เพิ่ม) · Workshop 10 (MCP server) กำลังทำ — W10-1 ถึง W10-4 เสร็จ, เหลือ W10-5 (packaging + stale) กับ W10-6 (README)

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

## ส่วนขยาย — retrieval แบบอื่น (ยังไม่เริ่ม) → [แผน](plans/README.md)

> มาจากการสำรวจว่าปัจจุบันมี retrieval แบบไหนอีกนอกจาก 4 แบบที่ทำไปแล้ว
> **ยังไม่เริ่มทำ — เก็บแผนไว้ก่อน ค่อยตัดสินใจทีหลังว่าจะเอาตัวไหน** (ตัดสิน 2026-08-23)
> **นโยบาย dependency:** โมเดลที่รันผ่าน `@huggingface/transformers` เดิม อนุมัติล่วงหน้าแล้ว โหลดได้เลย · npm package ตัวใหม่ต้องถามก่อน → ดู [plans/README.md](plans/README.md)

### Workshop 06 — Graph traversal → [แผน](plans/06-graph-traversal.md)

> ✅ ไม่ต้องเพิ่ม dependency เลย — ใช้ `note.links` ที่ `core/` parse ไว้ตั้งแต่ P0-3 แต่ไม่มี backend ไหนแตะตลอด WS01–05

- [x] **W6-1** ขยาย query set ด้วย `multi-hop` ≥5 ข้อ + วัด baseline (ห้ามข้าม)
- [x] **W6-2** `link-graph.ts` — adjacency + backlink + สถิติกราฟ
- [x] **W6-3** `graph.backend.ts` — seed จาก backend เดิม แล้วขยายตาม link
- [x] **W6-4** วัดผล — multi-hop ดีขึ้นแค่ไหน / single-hop แย่ลงแค่ไหน
- [x] **W6-5** README

**Gate:** ตอบได้ว่ากราฟที่คนเขียนเอง คุ้มกว่าหรือแย่กว่ากราฟที่ LLM สกัดให้ ✅ — deterministic 100% + ตรวจสอบได้ทุกเส้นทาง แลกกับความครอบคลุมที่จำกัดตามวินัยการเขียน wikilink ดู [workshops/06-graph-traversal/README.md](workshops/06-graph-traversal/README.md)

**หมายเหตุสำคัญจาก Workshop 06:**
- baseline `router-fuse` ได้ multi-hop recall 1.00 อยู่แล้วโดยไม่มี graph เลย — งานของ graph จึงไม่ใช่ "ทำให้ multi-hop หาเจอ" แต่คือทำให้ backend เดี่ยวที่เร็วกว่า fuse มากได้ผลใกล้เคียงกัน
- D-9 (`score = max(seedScore × decay^hop)`) ขัดกับสเปก W6-3 ("note ที่ถูกชี้จากหลาย seed ต้องได้คะแนนสะสม") เอง — แก้เป็น max ภายในเส้นทางเดียวกัน (seed เดิม) แต่ sum ข้าม seed ต่างกัน (คล้าย RRF ของ WS04)
- วัดแล้วพบ noise จริงตามที่ D-9 กังวล: `ripgrep+keyword` และ `vector+filtered` recall ร่วง 0.10 ที่ h=1 — ยืนยันว่าการวัดจริง ไม่ใช่แค่ทฤษฎี
- backend `graph` ถูก register เข้า `backends/index.ts` แล้ว (seed=router-route, hops=1, forward) — `npm run bench` แสดง 6 แถวแล้ว recall@5=0.86

### Workshop 07 — Cross-encoder reranking → [แผน](plans/07-reranking.md)

> ⚠️ precision@5 ของ `router-fuse` = 0.33 ซึ่งเป็น **89% ของเพดานทฤษฎี (0.37)** อยู่แล้ว — อาจไม่มีที่ให้ rerank ปรับปรุง

- [x] **W7-1** พิสูจน์ headroom ด้วย oracle ceiling ก่อน (ขยาย query set ถ้าจำเป็น)
- [x] **W7-2** Spike — หา cross-encoder ที่รองรับไทย (`ms-marco` เป็น English-only)
- [x] **W7-3** `rerank.backend.ts` — 2-stage + แยก `stage1Ms`/`rerankMs`
- [x] **W7-4** วัด trade-off ของ topN (5/10/20/50)
- [x] **W7-5** README

**Gate:** ตอบได้ว่า reranking คุ้มไหมที่ vault ขนาดนี้ ✅ — "ไม่คุ้ม" ยกเว้นกรณีเดียว: backend เดี่ยวที่มี oracle gap สูง (vector, topN=10) ที่อื่นจ่าย O(N) เต็มๆ แลกผลตอบแทนแทบไม่มี ดู [workshops/07-reranking/README.md](workshops/07-reranking/README.md)

**หมายเหตุสำคัญจาก Workshop 07:**
- oracle ceiling พิสูจน์แม่นจริง: rerank(vector, topN=10) วัดได้ recall=0.827 ตรงกับตัวเลขที่ทำนายไว้ล่วงหน้าเป๊ะ
- `router-fuse` มี oracle gap = 0.000 — reranking ช่วยอะไรไม่ได้เลยกับ backend ที่จัดอันดับดีที่สุดอยู่แล้ว
- เจอ abstraction ไม่ทำงานตามโฆษณาอีกครั้ง (ธีมเดิมจาก WS03): โมเดลติด tag "transformers.js" แต่ `AutoModelForSequenceClassification` โยน error เพราะ config.json ไม่มี `model_type` ต้อง import class ตรง (`XLMRobertaForSequenceClassification`)
- throughput ที่วัดจากประโยคสั้นไม่สะท้อนต้นทุนจริง — เอกสารเต็มจากวอลต์ (800 ตัวอักษร) ช้ากว่า spike ~5-8 เท่า
- ไม่พบเคสที่ rerank ทำให้แย่ลงแม้แต่ตัวเดียว (ทดสอบครบ 3 backend × 25 query ที่ topN=5) — รายงานตรงๆ ว่า query set นี้อาจยังไม่มีเคสกำกวมพอ ไม่ได้แปลว่า reranking ไม่มีความเสี่ยงเลย
- `rerank` **ไม่ได้** register เข้า `backends/index.ts` (topN≥20 ทำให้ `npm run bench` ช้าเกินไป) — เก็บเป็น backend ที่ทดสอบแล้วจริงแต่เรียกแยก เหมือน LanceDB ANN ใน WS03

> **Workshop 08 (Learned sparse/SPLADE) และ Workshop 09 (Late interaction/ColBERT) ถูกถอดออกจากแผนแล้ว (2026-08-23)**
> ทั้งสองติดอยู่ที่จุดที่ต้องพึ่ง ML model เพิ่มเพื่อตัดสินใจว่าทำต่อได้ไหม (WS08 หา multilingual SPLADE
> ที่มี ONNX ใช้จริงไม่เจอ, WS09 หาเจอแต่ไฟล์ใหญ่ 2.1GB และมีความเสี่ยงเรื่อง ONNX output ไม่ตรง)
> ตัดสินใจไม่ผูกความคืบหน้าของโปรเจกต์ไว้กับการหาโมเดลเพิ่มอีก — ลบแผนและ README ที่เกี่ยวข้องออกแล้ว

---

## Workshop 10 — MCP server (ใช้ใน Cursor) → [แผน](plans/10-mcp-server.md)

> ✅ **D-11/D-12/D-13/D-14 ตัดสินครบแล้ว (2026-08-23):** วัดผล + ใช้งานจริง · read-only · วัดฝั่งเราละเอียดแล้วเทียบ Cursor เชิงคุณภาพ · **เขียน JSON-RPC เองก่อน** (SDK เป็น fallback ที่อนุมัติล่วงหน้าแล้ว ถ้า W10-1 ต่อไม่ติด)
> **ทำแยกจาก Workshop 06–09 ได้เลย** ใช้ backend ที่มีอยู่แล้วตั้งแต่ WS04
> **D-14 ยืนยันจากผลจริง:** ต่อ Cursor ติดตั้งแต่รอบแรกด้วย JSON-RPC ที่เขียนเอง (เห็นสถานะ Connected + "1 tool enabled" ใน Cursor Settings → Tools & MCPs) — **ไม่ต้องสลับไป SDK**

- [x] **W10-1** Spike — ต่อ Cursor ให้ติดด้วย tool เดียว + ตัดสิน D-14 จากผลจริง (ยืนยันใน Cursor UI จริงแล้ว — server `memory-workshop` ขึ้น Connected)
- [x] **W10-2** `src/cli/mcp.ts` — tools `search_memory` / `get_memory` (read-only) — ทดสอบผ่าน JSON-RPC ตรงๆ (initialize/tools-list/tools-call ทั้ง valid + error case: layer ผิด, id ไม่มี, query ว่าง) ยังไม่แก้ไฟล์เดิมใน `src/` เลย มีแค่ `mcp.ts` (ยืนยันด้วย `git status`)
- [x] **W10-3** วัดต้นทุนฝั่งเรา — MCP overhead ต่อ query + cold start (stdio vs HTTP) — สคริปต์ `src/cli/bench-mcp.ts` (`npm run bench:mcp`) spawn `serve.ts`/`mcp.ts` จริงเป็น child process แล้ววัด 3 ชั้น (warmup 3 + วัด 20 เท่า `bench.ts`):
  - **MCP overhead ล้วนๆ (ชั้น MCP tool call ลบ HTTP serve.ts): ~0.01ms = 1.5% ของ round-trip** — เกือบเป็นศูนย์ ต่างจาก WS05 ที่ HTTP+JSON เพิ่ม ~15–20ms ชัดเจน เพราะ MCP JSON-RPC เป็น HTTP+JSON ชั้นเดียวกันอยู่แล้ว (mcp.ts ก็ใช้ `node:http` เหมือน `serve.ts`) ไม่มี layer ใหม่มาซ้อนจริงๆ
  - p50 ต่อ query kind (engine / HTTP serve.ts / MCP): exact 27.74/28.50/28.52ms (spawn `rg` subprocess ครอบงำ), keyword 0.19/0.75/0.75ms, semantic 0.15/0.67/0.69ms, filtered 0.06/0.52/0.53ms, multi-hop 0.16/0.69/0.69ms
  - **cold start ไม่ต่างกันตามที่ W10-2 คาด:** stdio 615ms vs HTTP call แรก 628ms — ใกล้เคียงกันมาก เพราะ warm-up (index 6 backend + embedding cache ที่ disk) จ่ายเท่ากันไม่ว่า transport ไหน **ความต่างจริงไม่ใช่ latency ของการ warm-up แต่เป็นความถี่ที่ต้องจ่าย**: stdio ให้ Cursor spawn process ใหม่ทุกครั้งที่เปิด = จ่าย ~620ms ซ้ำทุก session, HTTP จ่ายครั้งเดียวตอน server เริ่มแล้วเรียกซ้ำที่ process เดิมได้เหลือแค่ ~30ms (steady state) ตลอดไป
  - raw JSON: `data/bench-mcp-2026-08-23T09-04-19-123Z.json`
- [x] **W10-4** เทียบคุณภาพกับ Cursor indexing ด้วย ground truth (10 query, ทำมือ) — ผลสรุปตามจริง 100% (ผู้ใช้เป็นคนถามใน Cursor เอง ผมคำนวณ/เทียบให้):
  - **ตัวเลข MCP (router-route, สูตรเดียวกับ bench.ts):** recall@5 เฉลี่ย 10 query นี้ = **0.683**
  - **ตัวเลข Cursor:** วัด 2 แบบต่อ query — "ตอบทันที" (spontaneous) vs "ถามย้ำว่าอ้างอิงไฟล์ไหน" (follow-up เดียวกัน tab) — spontaneous เฉลี่ย **0.675** (ใกล้เคียง MCP มาก), follow-up เฉลี่ย **1.00** (เจอ ground truth ครบทุกไฟล์ทุก query ที่ถามย้ำ 9/10 ข้อ — ข้อ 1 ไม่ได้ถามย้ำเพราะยังไม่ได้คิดวิธีนี้ตอนนั้น)
  - **Key finding:** Cursor **รู้มากกว่าที่มันเลือก cite เอง** — spontaneous undercounts ของจริงที่มันค้นเจอ ต้องถามตรงๆ ถึงจะได้ citation ครบ นี่คือความต่างสำคัญจาก MCP ที่คืน id ไฟล์ตรงๆ ทุกครั้งไม่ต้องถามซ้ำ
  - **เคสที่ MCP ชนะชัด:** query kind `exact`/`keyword` (q1-4) — MCP/router ได้ 1.00 ทุกข้อ (route ไป ripgrep/fts5 ที่ literal match แม่นกว่า) ขณะที่ Cursor spontaneous บนข้อ exact ได้แค่ 0.33-0.50 — สอดคล้องกับที่ WS01-03 เคยพบว่า identifier-like query แพ้ semantic search
  - **เคสที่ Cursor ชนะชัด:** query kind `semantic`/`multi-hop` (q5,6,9,10) — MCP ได้ 0.33/0.00/0.50/0.00 (recall ต่ำมาก) แต่ Cursor ตอบถูกแม้แบบ spontaneous (0.67/0.25/1.00/1.00) โดยเฉพาะ q10 (incident/scaling) ที่ MCP พลาดทั้ง 3 ไฟล์แต่ Cursor เจอครบตั้งแต่ตอบครั้งแรก — น่าจะมาจาก multi-step search ("Explored X files, N searches") ที่ MCP ของเราไม่มี (เราค้นครั้งเดียว ไม่มี query reformulation)
  - **รายงานตรงๆ ตามกติกา plan:** Cursor ชนะ MCP ในสัดส่วน query ที่มากกว่า (โดยเฉพาะ semantic/multi-hop) — MCP ชนะเฉพาะ exact/keyword ที่พึ่ง literal match
  - **Setup ที่ทำซ้ำได้:** Cursor (build ที่ผู้ใช้ใช้ ณ 2026-08-23), โหมด **Ask** (ไม่ใช่ Agent — ดู pitfall ด้านล่าง), เปิดโฟลเดอร์ vault ที่ **copy ออกมาแยกไม่มี .git ครอบ** (ดูเหตุผลด้านล่าง), index ของ vault ขนาดนี้ (55 ไฟล์) เร็วมาก ไม่ต้องรอนาน
  - **⚠️ Pitfall ที่เจอระหว่างทาง (สำคัญ เก็บไว้เตือนคนทำซ้ำ):**
    1. **Agent mode ไม่ใช่ black-box indexing** — Cursor Agent mode มี terminal access เต็ม ไม่ sandbox ตาม workspace ที่เปิด สามารถ `cd` ออกไปรันโค้ดของ repo อื่นได้ (เจอจริง: มันสั่ง `npx tsx` เรียก fts5 backend ของเราเองมาตอบ) ทำให้ผลที่วัดได้ไม่ใช่ Cursor indexing เลย ต้องใช้ **Ask mode** เท่านั้นถึงจะวัดกลไกในตัว Cursor ได้จริง
    2. **เปิดแค่ subfolder ของ git repo ไม่ได้แปลว่า index ถูกตัดขอบตามนั้น** — เปิด `vault/` เป็น workspace ทั้งที่มันอยู่ใต้ repo `agent-memory-poc` ที่มี `bench/queries.json` (ground truth ตรงๆ) อยู่ด้วย ผลคือ Cursor (แม้ Ask mode, แท็บใหม่ไม่มีประวัติ) ยังหา `bench/queries.json` เจอและอ้างคำตอบเฉลยตรงๆ ได้ — ต้อง **copy vault/ ไปไว้นอก git repo ที่ไม่มีไฟล์โปรเจกต์อื่นอยู่ใกล้เลย** ถึงจะวัดสะอาดจริง
- [ ] **W10-5** Packaging + จัดการ index stale (ใช้จริงอย่างน้อย 1 วันทำงาน) — เริ่มสะสม usage แล้ว:
  - **2026-08-23:** ยืนยัน end-to-end ครั้งแรกว่า agent เรียก MCP tool เองถูกต้องจริงในการใช้งานทั่วไป (ไม่ต้องสั่ง/บังคับ) — ถามคำถามธรรมดา "ลูกค้าขอคืนเงินแล้วระบบค้าง ควรทำยังไง" ใน Agent mode แล้วเห็น "Ran search_memory in memory-workshop" × 2 + "Ran get_memory in memory-workshop" × 3 คำตอบที่ได้ถูกต้องตรงกับ vault (อ้าง Case 2891, refund-timeout-policy, verifyPayment)
  - **Pitfall ที่เจอ:** หลังแก้ `mcp.ts` เพิ่ม tool (W10-2) Cursor ไม่ re-fetch tool list เองแม้กด reload ใน Settings ครั้งแรก (ยังค้างที่ "1 tool enabled") ต้องเปิด dialog "Configure memory-workshop" แล้วกดปุ่ม **Reload** ตรงนั้นเฉพาะ ถึงจะได้ tool list ใหม่ครบ 3 ตัว — จดไว้เป็นขั้นตอนที่ต้องทำทุกครั้งที่แก้ `mcp.ts` แล้วจะทดสอบใน Cursor ต่อ
  - ยังไม่ครบ 1 วันทำงานตาม DoD — ต้องใช้งานต่อเนื่องเพิ่ม
- [ ] **W10-6** README

**Gate:** ตอบได้ด้วยตัวเลขว่าประสิทธิภาพจาก WS01–05 ตามมาถึง Cursor ไหม หรือถูก MCP overhead กลบ

**ข้อจำกัดที่ต้องเขียนกำกับไว้ตลอด:** Cursor indexing เป็นกล่องดำ — **ห้ามเคลม** ว่า MCP เร็วกว่า/ช้ากว่ากี่เท่า · เคลมได้แค่ overhead ฝั่งเรา (วัดเองได้) กับคุณภาพการดึงเอกสาร (มี ground truth อยู่แล้ว)

---

## ส่วนขยาย — Scale test ที่ 1,945 ไฟล์ → [แผน](plans/11-scale-1000.md)

> ไม่ใช่ workshop ใหม่ในโครงนับเลข 01-10 — ทดสอบว่าตัวเลข recall/latency/MCP ที่วัดจาก vault 55 ไฟล์จริงยัง hold อยู่ไหมเมื่อ corpus ใหญ่ขึ้น 35 เท่า

- [x] **สร้าง synthetic distractor vault** — 30 โดเมนธุรกิจสมมติ (ไม่เกี่ยวกับ payment/refund/order เลย) × 63 ไฟล์/โดเมน = 1,890 ไฟล์ ผ่าน `src/cli/generate-synthetic-vault.ts` — vault เดิม 55 ไฟล์จริง + `bench/queries.json` (ground truth) **ไม่ถูกแตะเลย** รวมเป็น 1,945 ไฟล์ ยืนยันด้วย `readVault()` (0 error) และ `git status` (55 ไฟล์เดิม/ground truth/`src/core/` ไม่เปลี่ยน)
- [x] **เชิงปริมาณ — `npm run bench` วัด 3 จุด (55 / 1,000 / 1,945 ไฟล์)**:

  | backend | recall@5 (55) | recall@5 (1,000) | recall@5 (1,945) | p50 (55) | p50 (1,000) | p50 (1,945) |
  |---|---|---|---|---|---|---|
  | ripgrep | 0.74 | 0.69 | 0.62 | ~30ms | 42.24ms | 53.98ms |
  | fts5 | 0.72 | 0.67 | **0.67** | ~0.06ms | 0.12ms | 0.13ms |
  | vector | 0.78 | 0.63 | **0.53** | ~0.14ms | 1.64ms | 3.46ms |
  | router-route | ~0.845 | 0.71 | 0.65 | ~0.19ms | 1.72ms | 3.48ms |
  | router-fuse | ~0.925 | 0.85 | 0.81 | ~29ms | 45.35ms | 54.73ms |
  | graph | 0.86 | 0.72 | 0.65 | ~0.19ms | 1.69ms | 3.36ms |

  **recall:** ตกต่อเนื่องทุก backend ยิ่ง scale ใหญ่ยิ่งตกมากขึ้น — **vector ตกหนักสุดและตกต่อเนื่อง** (0.78→0.63→0.53) เพราะยิ่งมี candidate เยอะยิ่งมีโอกาสที่ distractor ที่ใช้คำศัพท์คล้ายกัน (timeout/retry/policy/incident ข้ามโดเมน) แซงคำตอบจริง ตรงข้ามกับ **fts5 ที่นิ่งที่สุดในระบบ** (0.67 เท่ากันเป๊ะทั้ง 1,000 และ 1,945 ไฟล์) เพราะ exact/keyword match ไม่สนใจปริมาณ noise เลย ส่วน `router-fuse` ยังสูงสุดตลอดทุก scale (0.81 ที่ 1,945 ไฟล์) แต่ก็ตกตามเทรนด์เดียวกัน
  **latency:** โตแบบ **sub-linear** สำหรับ ripgrep/fts5/router-fuse (ไฟล์โต 35 เท่า แต่ latency โตแค่ ~1.8-2.2 เท่า เพราะต้นทุนหลักคือ subprocess-spawn/O(log n) index ซึ่งเป็นค่าคงที่) ต่างจาก **vector ที่โตเกือบเป็นสัดส่วนตรง** (~25 เท่า) เพราะต้องคำนวณ cosine similarity เทียบทุก embedding — แต่ในหน่วยจริงยังเร็วมาก (3.46ms)

- [x] **เชิงปริมาณ — `npm run bench:mcp` วัด 3 จุด (55 / 1,000 / 1,945 ไฟล์)**:

  | ตัวชี้วัด | 55 ไฟล์ | 1,000 ไฟล์ | 1,945 ไฟล์ |
  |---|---|---|---|
  | MCP overhead (ms) | 0.01ms | 0.12ms | **1.53ms** |
  | MCP overhead (% ของ round-trip) | 1.5% | 4.4% | **22.1%** |
  | cold start stdio | 615ms | 1,935ms | 2,859ms |
  | cold start HTTP ครั้งแรก | 628ms | 2,140ms | 2,751ms |
  | steady state (warm) | 30.5ms | 49ms | 51.3ms |

  **cold start:** ยัง sub-linear ตลอด (35 เท่าไฟล์ → ~4.5 เท่า cold start) เพราะต้นทุนหลักคือ vector embedding build ที่โตช้ากว่าไฟล์ (4.5s→39.5s ที่ 1,000 ไฟล์, ~8.7 เท่า) — **steady state แทบไม่ขยับเลย** (30.5→51.3ms) เป็นข่าวดีที่สุด: ถ้า MCP server อุ่นแล้ว เรียกซ้ำเร็วเท่าเดิมไม่ว่า scale ไหน
  **MCP overhead กลับไม่ sub-linear** — จาก 1,000→1,945 ไฟล์ (ไฟล์โตแค่ ~1.9 เท่า) overhead แบบ absolute โตถึง ~12.75 เท่า (0.12ms→1.53ms) เห็นชัดสุดในทุก query kind ที่ไม่ใช่ `exact`/`filtered`: engine ~5.5ms, HTTP ~5.6-5.8ms, แต่ MCP กระโดดไป ~7.0-7.2ms — ส่วนต่าง MCP-vs-HTTP โตจาก ~0.1ms เป็น ~1.3-1.4ms สม่ำเสมอทุก kind ไม่ใช่ noise ของ query เดียว สาเหตุที่เป็นไปได้: payload ที่ JSON-RPC ต้อง serialize/deserialize ใหญ่ขึ้นตาม index size ทำให้ต้นทุนห่อ JSON-RPC ของ MCP layer โตเร็วกว่า raw HTTP handler — **เป็นจุดที่ต้องระวังถ้า scale ไปไกลกว่านี้** แม้ในหน่วย absolute ยังเล็กมาก (1.53ms)
- [x] **เชิงคุณภาพ — ทดสอบผ่าน Cursor จริง (Agent mode) ที่ 1,945 ไฟล์** 4 query (reload MCP connection ก่อนเริ่มเพื่อล้าง cache ของ vault เก่า):
  1. *"ลูกค้าขอคืนเงินแล้วระบบค้าง"* (semantic, มี baseline จาก 55 ไฟล์) — **ผ่าน ไม่ตก**: `search_memory`×1, `get_memory`×4 (เทียบ baseline ×2/×3) คำตอบแม่นเท่าเดิมทุกจุด (Case 2891, `REFUND_STUCK_THRESHOLD_MIN`, `verifyPayment`) แถมดึง Case 3401 เพิ่มโดยไม่ถูกถาม
  2. *"PAYMENT_GATEWAY_TIMEOUT_MS คืออะไร"* (exact identifier) — รอบแรก agent เลือกใช้ grep ของ Cursor เองแทน MCP (เพราะ workspace ไม่ isolate เห็นไฟล์ vault ตรงๆ) คำตอบถูกต้อง; **บังคับ MCP-only แล้วลองซ้ำ — ผ่านสะอาด**: `search_memory`×1, `get_memory`×2 คำตอบถูกต้องครบพร้อม citation
  3. *"หุ่นยนต์หยิบสินค้าไม่สำเร็จควร retry กี่ครั้ง"* (semantic, เนื้อหาสังเคราะห์ใหม่ล้วนๆ ไม่มีใน ground truth เดิม) — **ผ่าน**: `search_memory`×2 (ลองคำค้นไทยแล้ว fallback เป็นอังกฤษ), `get_memory`×4 — ยืนยันด้วย grep ตรงไฟล์จริงว่าคำตอบ (`PICK_ENGINE_MAX_RETRY`, `failed_soft`/`failed_hard`) ตรงเกือบคำต่อคำ ไม่ใช่ hallucination
  4. *"แพทย์เข้าถึงเวชระเบียนผู้ป่วยได้เมื่อไหร่"* (bonus, สังเคราะห์ domain อื่น) — **ผ่าน**: สังเคราะห์คำตอบจาก 3 ไฟล์แยกกัน (policy หลัก + edge case consult ข้ามแผนก 72 ชม. + emergency break-glass 48 ชม.) ถูกต้องครบ ยืนยันด้วย grep ตรงไฟล์จริง
- [x] **Finding สำคัญ:** agent สลับใช้เครื่องมือตามประเภทคำถามเมื่อมีทั้ง MCP กับ built-in grep ให้เลือก (exact identifier → ลองใช้ grep ของ Cursor เองก่อน, semantic → ใช้ MCP โดยตรง) — พฤติกรรมสมเหตุสมผล ไม่ใช่ error แต่หมายความว่า **การไม่ isolate workspace ทำให้วัด "MCP ล้วนๆ" ไม่สะอาด 100%** ต้องบังคับใน prompt ("ใช้ MCP tool เท่านั้น") ถ้าต้องการผลที่ตัดปัจจัย built-in indexing ออก

**Gate:** ตอบได้ว่า agent ยังเลือกเรียก MCP tool ถูกจังหวะไหมที่ scale 1,945 ไฟล์ และคำตอบยังแม่นยำในระดับที่ยอมรับได้ไหม ✅ — **ผ่านทั้ง 4/4 test case เชิงคุณภาพ** แม้ตัวเลข recall เชิงปริมาณ (bench.ts) จะตกลงจริงและต่อเนื่องที่ scale ใหญ่ขึ้น การใช้งานจริงผ่าน agent (ที่มี reasoning ช่วยกรอง noise) ทนทานกว่าตัวเลข raw recall ที่วัดจาก backend ตรงๆ — สอดคล้องกับ finding เดิมจาก W10-4 ที่ว่า "Cursor รู้มากกว่าที่มันเลือก cite เอง"

**ตัวเลขทั้งหมด (เชิงปริมาณ + เชิงคุณภาพ) วัดที่ scale เดียวกัน (1,945 ไฟล์) แล้ว** — raw JSON: `data/bench-2026-08-28T08-38-11-950Z.json`, `data/bench-mcp-2026-08-28T08-42-27-657Z.json`

---

## ส่วนขยาย — Domain facet แก้ปัญหา vector recall ตกที่ scale → [แผน 12](plans/12-domain-facet.md) / [แผน 13](plans/13-domain-facet-test.md)

> เพิ่ม `domain: string` (required) เข้า `MemoryNote` และ `domain?: string` เข้า `SearchQuery` — **แก้ `core/` ครั้งแรกหลัง Phase 0** (ดู invariants ด้านล่าง) เพื่อให้ pre-filter ตัด candidate pool ข้าม domain ก่อนคำนวณ cosine ได้จริง

**Plan 12 (สร้าง facet) — เสร็จครบ T1-T8:**
- [x] **T1-T2** เพิ่ม field ใน `core/types.ts` + derive `domain` จาก path ใน `vault-reader.ts` (rule: subfolder ขึ้นต้น `synthetic-` → ตัด prefix, ไม่มี subfolder → `"core"`) — **ไม่ต้อง regenerate 1,890 ไฟล์เลย** ข้อมูลมาจาก path ที่มีอยู่แล้ว
- [x] **T3** เพิ่ม domain filter เข้า `vector.backend.ts`, `ripgrep.backend.ts`, `fts5.backend.ts` — `router.ts`/`graph.backend.ts` **ไม่ต้องแก้เลย** (พบระหว่างทำว่าเป็น pass-through อยู่แล้ว ไม่ได้ reconstruct query object)
- [x] **T4** เพิ่ม `domain` parameter ใน `mcp.ts` tool `search_memory` — ทดสอบผ่าน JSON-RPC จริง: `domain="core"` คืนเฉพาะไฟล์ PayFlow, `domain="warehouse-robotics"` คืนเฉพาะไฟล์โดเมนนั้น ไม่ปนกันเลย
- [x] **T5** บันทึกเหตุผลการแก้ `core/` ไว้ใน invariants section (ดูด้านล่าง)
- [x] **T6** แก้ `router.test.ts` fixture (`makeNote`) เพิ่ม `domain: "core"` — `npm run test` ผ่านครบ 11/11 เหมือนเดิม
- [x] **T7** FTS5 schema migration — เพิ่มคอลัมน์ `domain TEXT NOT NULL` + index ใน `schema.sql`, แก้ `INSERT`/`UPDATE` ใน `reindex-core.ts`, แก้ SQL filter ใน `fts5.backend.ts` — ลบ `data/index.sqlite` เก่าแล้ว `npm run reindex -- --full` ใหม่ (schema เปลี่ยน ต้อง full ไม่ใช่ incremental) ยืนยันด้วย query ตรง: 31 distinct domain (30 synthetic + core), core มี 55 note พอดีตรงกับ PayFlow จริง
- [x] **T8** เพิ่ม `domain` query param ใน `serve.ts` + ช่อง filter ใน `web/app/page.tsx` (input ข้าง tags ไม่ใช่ dropdown เพราะ domain มีได้ 31 ค่า ไม่ตายตัวแบบ layer)

**Plan 13 (วัดผลจริง) — เสร็จ T1-T3, T5 (ข้าม T4 bonus):**

| backend | recall ไม่ filter @ 1,945 | recall filter `domain=core` @ 1,945 | baseline @ 55 ไฟล์ | ผล |
|---|---|---|---|---|
| **vector** | 0.53 | **0.75** | 0.78 | +0.22 ใกล้ baseline |
| ripgrep | 0.62–0.64 | **0.73** | 0.74 | +0.10 เกือบเท่า baseline |
| fts5 | 0.67 | **0.75** | 0.72 | +0.08 **เกิน baseline** |
| router-route | 0.63–0.65 | **0.82** | ~0.845 | +0.18 ใกล้ baseline |
| **router-fuse** | 0.79–0.81 | **0.93** | ~0.925 | +0.13 **เกิน baseline** |
| graph | 0.65 | **0.86** | 0.86 | +0.21 **เท่า baseline เป๊ะ** |

**latency ก็ดีขึ้นด้วย ไม่ใช่แค่ recall** — vector p50 3.46ms → **0.24ms**, router-route 3.48ms → 0.31ms (candidate pool เล็กลง 35 เท่าจริง วัดได้ทั้งสองด้าน)

**สมมติฐานของ plan 13 ยืนยันแล้ว:** เมื่อ filter ทำงานถูกจริง candidate pool กลับไปเทียบเท่า 55 ไฟล์ recall จึงกลับไปใกล้เคียง (หรือเกิน เพราะ noise ที่เคยมี MRR/tie-break ผันผวนหายไปด้วย) baseline เดิม — พิสูจน์ว่า domain facet แก้ปัญหาตรงจุดจริง ไม่ใช่แค่ทฤษฎี

**Finding แถมที่เจอระหว่างทาง (ไม่เกี่ยวกับ domain facet โดยตรง แต่สำคัญ):** รัน `npm run bench` **โค้ดเดียวกันเป๊ะ ไม่มีการแก้ไขใดๆ ระหว่างสองรอบ** ติดกัน 2 ครั้งที่ 1,945 ไฟล์ ได้ recall/MRR ต่างกัน (เช่น router-fuse 0.79 → 0.81, ripgrep MRR 0.59 → 0.57) — **ขัดกับที่ README เคยระบุว่า "recall/precision/MRR reproducible 100%"** ซึ่งเป็นจริงที่ scale เล็ก (55 ไฟล์) แต่ไม่ hold ที่ 1,945 ไฟล์ สาเหตุที่เป็นไปได้มากที่สุด: content ที่ใกล้เคียงกันมาก (จาก template เดียวกัน ดู cosine similarity 0.77-0.89 ที่วัดไว้ก่อนหน้า) ทำให้เกิด **tie score บ่อยขึ้น** และการตัด tie ขึ้นกับลำดับที่ไม่รับประกันความคงที่ข้าม run (เช่น ripgrep parallel directory traversal) — **ยังไม่ได้สืบสาเหตุลึกหรือแก้ไข เก็บไว้เป็น finding สำหรับ session ถัดไป**

**Gate ของทั้งสองแผน:** ✅ ผ่านครบ — domain filter ทำงานถูกต้อง (unit test + JSON-RPC ยืนยัน), ไม่มี regression ต่อ query ที่ไม่ระบุ domain (ความต่างเล็กน้อยที่เจอมาจาก non-determinism ข้างต้น ไม่ใช่จาก domain facet), recall กู้กลับมาได้จริงตามที่คาดการณ์ไว้

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
- [!] `core/` ไม่ถูกแก้หลัง Phase 0 (CLAUDE.md §2.4) — **ทำลาย invariant นี้อย่างมีสติแล้วที่ [plans/12-domain-facet.md](plans/12-domain-facet.md) (2026-08-28)**: เพิ่ม field `domain: string` (required) เข้า `MemoryNote` และ `domain?: string` เข้า `SearchQuery` เพื่อแก้ปัญหา vector recall ตกหนักที่ scale ใหญ่ (cosine similarity ข้าม synthetic domain สูงถึง 0.77-0.89 เพราะ template ซ้ำกัน วัดจริงแล้ว) — เป็นการแก้แบบ **additive เท่านั้น** (เพิ่ม field ใหม่ ไม่เปลี่ยน field เดิม, `SearchQuery.domain` optional ไม่กระทบ query เดิม) ตัดสินใจร่วมกับผู้ใช้ผ่าน `AskUserQuestion` ก่อนแก้ ไม่ใช่การพลาดหรือมองข้าม — เก็บ invariant เดิมไว้เป็น `[x]` ต่อจาก Phase 0 ถึงก่อน 2026-08-28 เพื่อ audit trail ว่า core freeze ยึดได้นานแค่ไหนก่อนมีเหตุผลจริงให้แก้
- [x] ลบ `data/` ทั้งโฟลเดอร์แล้ว rebuild ได้ ไม่มีข้อมูลหาย (CLAUDE.md §2.2) — ทดสอบจริงตอนจบ WS04 (`data/index.sqlite`, `data/embeddings.sqlite` ลบแล้ว `npm run reindex -- --full` + `npm run bench` รันผ่านปกติ)
- [x] ไม่มี LLM call ใน decision path ใดๆ นอกจาก embedding ที่อนุมัติแล้ว (CLAUDE.md §2.1) — query classifier เป็น regex/นับคำล้วนๆ, RRF เป็นสูตรคณิตศาสตร์
- [x] `SearchBackend` signature ไม่เปลี่ยนตั้งแต่จบ WS01 (CLAUDE.md §4.2) — ยืนยันด้วยการอ่าน `backend.interface.ts` ตรงๆ
- [x] ทุก backend index ทั้ง vault ไม่มีการกรอง note ออก (CLAUDE.md §4.2) — ทุก backend รับ `notes: MemoryNote[]` เต็มจาก `readVault()` ไม่มีการ filter ก่อน index
- [x] ตัวเลขใน README ทุกตัวมาจากการรันจริง — ทุก README มีคำสั่งที่รันได้จริงกำกับ (`npm run bench`, `npm run reindex`, สคริปต์ทดลองเฉพาะกิจที่ลบทิ้งหลังบันทึกผลแล้ว)
