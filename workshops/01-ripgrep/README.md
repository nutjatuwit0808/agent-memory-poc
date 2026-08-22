# Workshop 01 — ripgrep

## คำถามตั้งต้น

- search ทำงานได้ยังไงโดยไม่มี index เลย?
- latency จริงบน vault ขนาดนี้เท่าไหร่ และมันโตตามอะไร?
- ripgrep แพ้ตรงไหน — จุดไหนที่ทำให้ต้องมี index ใน WS02

## ทฤษฎีสั้น

ไม่มี index = ต้องอ่านทุกไฟล์ทุกครั้ง → ต้นทุน O(ขนาด corpus) ต่อ 1 query ripgrep ชนะ `grep` ธรรมดาด้วย 3 อย่าง: literal prefilter (SIMD memchr), เดินไฟล์แบบ parallel, และข้ามไฟล์ที่ไม่ต้องอ่านตั้งแต่แรก (`.gitignore`-aware) สิ่งที่มันทำไม่ได้: ไม่รู้ว่าคำไหนสำคัญ (ไม่มี IDF — คำหายากกับคำธรรมดาได้น้ำหนักเท่ากัน) และไม่รู้ว่าคำไหนแปลว่าอะไร (ไม่มี semantic — คำคนละคำที่ความหมายเดียวกันจะไม่ match กันเลย)

---

## W1-1 — Spike: ripgrep availability + JSON shape

**เครื่องที่วัด:** Node.js v26.2.0, Windows 11 Home (10.0.26200), Intel(R) Core(TM) Ultra 7 265
**rg --version:** `ripgrep 15.2.0 (rev e89fff89ac)`, features `+pcre2`, simd compile `+SSE2 +SSSE3`, runtime `+SSE2 +SSSE3 +AVX2`

> **หมายเหตุ environment ที่เจอจริง:** เครื่องนี้ไม่มี Node 22 LTS และไม่มี ripgrep ติดตั้งไว้ก่อน ติดตั้งผ่าน `winget install BurntSushi.ripgrep.MSVC` ระหว่างทำ workshop นี้ ผู้ใช้ตัดสินใจใช้ Node 26 ตามที่มีอยู่แทนการติดตั้ง 22 LTS เพิ่ม (ดูรายละเอียดที่ [`CHECKLIST.md`](../../CHECKLIST.md)) ปัญหาที่เจอเพิ่ม: หลัง `winget install` แล้ว shell/process ที่รันอยู่ก่อนหน้า **ไม่เห็น PATH ใหม่ทันที** (ต้องเปิด terminal ใหม่จริงๆ ถึงจะเห็น) — `node:child_process.spawn("rg", ...)` แบบไม่ใช้ shell จะได้ `ENOENT` ถ้า PATH ยังไม่ refresh แม้ shell ทดสอบ manual จะดูเหมือนใช้ `rg` ได้ (เพราะบางเครื่องมือ dev มี shim ของตัวเองชื่อ `rg` บังหน้าอยู่) นี่คือเหตุผลที่ต้องมี preflight check จริงจัง ไม่ใช่แค่เชื่อว่า "test ตอน dev ผ่านก็คงพอ"

### JSON event types (ตัวอย่างจริงจาก vault นี้)

```jsonc
// begin — เริ่มสแกนไฟล์ใหม่ 1 ไฟล์
{"type":"begin","data":{"path":{"text":"vault/support-cases\\case-2891.md"}}}

// match — เจอ 1 บรรทัดที่ match (อาจมีหลาย submatch ในบรรทัดเดียว)
{"type":"match","data":{"path":{"text":"vault/support-cases\\case-2891.md"},"lines":{"text":"tags: [refund, stuck, payment-gateway]\n"},"line_number":3,"absolute_offset":24,"submatches":[{"match":{"text":"refund"},"start":7,"end":13}]}}

// end — จบไฟล์นั้น พร้อมสถิติของไฟล์เดียว
{"type":"end","data":{"path":{"text":"vault/support-cases\\case-2891.md"},"binary_offset":null,"stats":{"elapsed":{"secs":0,"nanos":166900,"human":"0.000167s"},"searches":1,"searches_with_match":1,"bytes_searched":2639,"bytes_printed":2859,"matched_lines":6,"matches":8}}}

// summary — สรุปทั้ง run เดียว มาท้ายสุดเสมอ (แม้ไม่เจอ match เลยก็ยังมี event นี้)
{"data":{"elapsed_total":{"human":"0.018325s","nanos":18324700,"secs":0},"stats":{"bytes_printed":44807,"bytes_searched":128419,"elapsed":{"human":"0.001623s","nanos":1622900,"secs":0},"matched_lines":95,"matches":134,"searches":32,"searches_with_match":32}},"type":"summary"}
```

**พฤติกรรม exit code ที่สำคัญ:** `rg --json` คืน exit code `0` เมื่อเจอ match, `1` เมื่อ**ไม่เจอ match เลย** (ไม่ใช่ error — ยังมี `summary` event ปกติ), และ `2`+ เมื่อเกิด error จริง (path ไม่มีอยู่, argument ผิด ฯลฯ) backend ต้อง treat exit code `1` เป็นผลลัพธ์ว่างเปล่า ไม่ใช่โยน error — พลาดจุดนี้จุดเดียวจะทำให้ query ที่ไม่เจออะไรเลย crash ทั้ง bench run

**เวอร์ชันมีผลกับ schema ไหม:** ยังไม่เคยเจอ breaking change ระหว่าง 13.x–15.x จาก field ที่ backend นี้ใช้ (`type`, `data.path.text`, `data.submatches[].match.text`) แต่ pin ขั้นต่ำไว้ที่ **rg ≥ 13** (เวอร์ชันที่ `--json` field เหล่านี้เสถียรแล้วตาม changelog ต้นน้ำ) ถ้าอนาคตเจอ schema เปลี่ยนให้กลับมาแก้ที่จุดเดียวคือ `rgMatchEventSchema` ใน `ripgrep.backend.ts`

---

## W1-2 — `ripgrep.backend.ts`

Implement ครบ 3 method ตาม `SearchBackend` interface ไม่แก้ signature:

- **`index()`** — no-op จริงๆ แต่ยังต้องเก็บ `notes` ไว้ใน `Map<id, MemoryNote>` เพราะ `SearchResult` ต้องคืน `MemoryNote` เต็มรูป การเก็บ Map นี้**ไม่ใช่ index สำหรับการค้นหา** — มันไม่ช่วยให้ `search()` เร็วขึ้นแม้แต่นิดเดียว แค่ใช้ map ผลลัพธ์ที่ rg บอกมาแล้วกลับเป็น object ที่ interface ต้องการเท่านั้น การค้นหาจริงยังคงเป็นการ spawn `rg` อ่านทุกไฟล์ทุกครั้งเหมือนเดิม
- **`search()`** — ตัด query เป็นคำด้วย whitespace แล้วส่งแต่ละคำเป็น `-e <word>` หลายตัว (rg รวมด้วย OR โดยอัตโนมัติ) พร้อม `-F` (fixed string) เพื่อไม่ให้อักขระ regex เช่น `(` `.` `*` ถูกตีความเป็น pattern
- **`stats()`** — `sizeBytes: 0`, `buildTimeMs: 0` ตรงๆ เพราะไม่มี index จริงให้วัด ไม่ใช่เลขปลอม

ทดสอบ query ที่มีอักขระ regex (เช่น `"REFUND_ALREADY_PROCESSED"` ที่มี `_`, หรือ query สมมติที่มี `(`) ผ่านโดยไม่ throw และไม่ให้ผลเพี้ยนเพราะ `-F` ปิด regex interpretation ไปเลย

---

## W1-3 — Scoring

```
score = matchCount + (exactPhraseMatch ? 5 : 0) + (matchInTitle ? 3 : 0)
```

- **`matchCount`** — จำนวนครั้งที่คำใดคำหนึ่งจาก query เจอในไฟล์ทั้งหมด เป็น proxy หยาบของความเกี่ยวข้อง แต่ไม่มี IDF จึงให้น้ำหนักคำหายาก ("refund") เท่ากับคำธรรมดา ("order")
- **`exactPhraseMatch` (+5)** — query ทั้งประโยคปรากฏเป็น substring ต่อเนื่องในเนื้อหา สัญญาณที่แม่นกว่าคำแยกกันมาก
- **`matchInTitle` (+3)** — มีคำจาก query ปรากฏในบรรทัดหัวข้อ (`# ...`) เพราะหัวข้อมักสรุปเนื้อหาทั้งไฟล์

### Length bias — เคสจริงจาก vault นี้

Query `"order"` (bench: `npx tsx` เรียก backend ตรงๆ, vault จริง 55 notes):

| Rank | Note | Score | จำนวนคำ |
|---|---|---|---|
| 1 | `business-logic/long-form-order-state-machine.md` | 52 | 632 |
| 2 | `business-logic/long-form-payment-lifecycle.md` | 25 | 659 |
| **3** | **`structure/module-order.md`** | **21** | **89** |
| 4 | `structure/module-inventory.md` | 17 | 67 |

`structure/module-order.md` คือเอกสาร reference ตัวจริงของ order module (ฟังก์ชัน, state machine ย่อ, event ที่ subscribe) แต่แพ้ `long-form-payment-lifecycle.md` ซึ่งพูดถึง "order" แค่ผ่านๆ ตอนอธิบายความสัมพันธ์กับ payment lifecycle — ชนะแค่เพราะไฟล์ยาว 659 คำเลยมีโอกาสเจอคำว่า "order" ซ้ำได้มากกว่าไฟล์สั้น 89 คำ ทั้งที่ความเกี่ยวข้องจริงต่ำกว่ามาก **นี่คือปัญหาที่ BM25 ใน WS02 แก้ให้** ด้วยการ normalize คะแนนตามความยาวเอกสาร (`avgdl` term ในสูตร BM25)

---

## W1-4 — Filter: layer / tags

Post-filter หลังได้ผลจาก rg แล้ว — **rg ยังคงอ่านทุกไฟล์เหมือนเดิมไม่ว่าจะ filter หรือไม่** งานสแกนทั้งหมดถูกทำไปแล้วก่อนที่ filter จะตัดผลลัพธ์ออก ต่างจาก WS02 ที่กรองได้ใน SQL `WHERE` ก่อนแม้แต่จะเริ่ม full-text search (ทำให้ query ที่ระบุ layer แคบกว่าทำงานเร็วกว่าจริง) และเป็นเหตุผลที่ WS04 ใช้ layer pre-filter เพื่อลดขอบเขตก่อนส่งต่อให้ backend อื่น

**Tags filter ใช้ AND ไม่ใช่ OR:** เพราะการระบุหลาย tag พร้อมกันในการค้นหาจริงมักสื่อว่าผู้ใช้ต้องการ "แคบผลลัพธ์ลง" (เช่น หา note ที่เป็นทั้ง `refund` และ `timeout` พร้อมกัน) ไม่ใช่ "ขยายผลลัพธ์ออก" — ถ้าต้องการ OR ผู้ใช้ยิง query แยกกันสองครั้งได้อยู่แล้ว แต่ไม่มีวิธีทำ AND ได้ถ้า backend ตั้ง default เป็น OR

**พิสูจน์ว่าเป็น post-filter จริง** (วัดจาก vault จริง, query `"refund"`, warmup 3 + วัด 15 รอบ, p50):

| Filter | p50 latency | ผลลัพธ์ |
|---|---|---|
| ไม่มี filter | 30.52ms | 10 |
| `layer: "business-logic"` | 30.66ms | 7 |
| `tags: ["refund"]` (AND) | 30.63ms | 6 |

ส่วนต่างอยู่ที่ **0.1–0.14ms** — เล็กจนถือว่าเป็น noise ยืนยันว่า filter ไม่ได้ลดงานที่ rg ต้องทำเลยแม้แต่นิดเดียว งานสแกนไฟล์ทั้งหมดเกิดขึ้นเหมือนกันไม่ว่าจะ filter ผลลัพธ์ท้ายสุดกี่ชั้นก็ตาม

ทดสอบ AND semantics: `tags: ["refund", "nonexistent-tag-xyz"]` → คืน 0 ผลลัพธ์ (ถูกต้อง เพราะไม่มี note ไหนมีทั้งสอง tag)

---

## W1-5 — วัดผล

**เครื่องที่วัด:** Node.js v26.2.0, Windows 11 Home (10.0.26200), Intel(R) Core(TM) Ultra 7 265, ripgrep 15.2.0
**วันที่วัด:** 2026-08-22
**Vault:** 55 notes, 161,968 bytes, ~14,728 words (Thai-aware estimate)

### ผลรวมทุก query (จาก `npm run bench`)

| backend | p50 (ms) | p95 (ms) | recall@5 | precision@5 | MRR | indexed | size (bytes) | build (ms) |
|---|---|---|---|---|---|---|---|---|
| ripgrep | 29.95 | 32.45 | 0.74 | 0.27 | 0.74 | 55 | 0 | 0.00 |

`size` และ `build` เป็น 0 จริงๆ — ไม่มี index ให้สร้าง (ตรงตาม `stats()` ที่ implement ไว้)

### แยกตาม query kind (10 รอบ/query, top-10 results)

| kind | recall@5 | precision@5 | MRR | p50 (ms) | p95 (ms) |
|---|---|---|---|---|---|
| exact | 1.00 | 0.48 | 0.90 | 28.88 | 30.84 |
| keyword | 0.90 | 0.24 | 0.85 | 28.89 | 32.07 |
| filtered | 1.00 | 0.32 | 1.00 | 28.91 | 30.48 |
| **semantic** | **0.07** | **0.04** | **0.20** | 28.67 | 31.83 |

**ripgrep แม่นมากกับ `exact`/`keyword`/`filtered`** (recall ≥ 0.90 ทุกตัว) เพราะ query เหล่านี้ใช้คำที่ปรากฏตรงตัวในเนื้อหาจริง แต่ **พังหนักกับ `semantic`** (recall เฉลี่ยแค่ 0.07 — แทบไม่เจออะไรเลย) เพราะ query แบบนี้ตั้งใจใช้คำคนละชุดจาก vault (เช่น `"อยากไม่เอาของแล้วหลังจ่ายเงินไปแล้ว ทำยังไงได้บ้าง"` แทนที่จะพูดว่า "ยกเลิกรายการ") — ไม่มีคำไหนใน query ตรงกับคำในเนื้อหาเลยแม้ความหมายจะตรงกัน 100% นี่คือขีดจำกัดที่ literal matching แก้ไม่ได้ไม่ว่าจะ tune สูตร scoring ยังไงก็ตาม ต้องรอ semantic search ใน WS03

### Latency vs corpus size (ยืนยันว่าไม่มี index จริง = โตแบบเชิงเส้น)

วัดด้วย query คงที่ (`"timeout refund payment"`) บน vault ที่ copy ซ้ำเป็นหลายขนาด (warmup 3 + วัด 8–15 รอบ):

| ขนาด corpus (ไฟล์) | p50 (ms) | p95 (ms) |
|---|---|---|
| 55 (1×) | 34.47 | 41.82 |
| 275 (5×) | 46.99 | 52.29 |
| 1,100 (20×) | 96.81 | 102.25 |
| 2,750 (50×) | 207.34 | 223.93 |
| 5,500 (100×) | 422.38 | 449.50 |

ที่ขนาดเล็ก (55–275 ไฟล์) ต้นทุนคงที่ของการ spawn subprocess (~25–30ms บนเครื่องนี้) กลบต้นทุนจริงของการสแกนไฟล์เกือบหมด ทำให้ดูเหมือนไม่โตเชิงเส้น แต่พอ corpus ใหญ่พอที่ต้นทุนสแกนจะเด่นกว่าต้นทุน spawn (ตั้งแต่ 1,100 ไฟล์ขึ้นไป) จะเห็นแนวโน้มเชิงเส้นชัดเจน: ไฟล์เพิ่ม 100 เท่า (55→5,500) latency เพิ่มประมาณ 12 เท่า (34→422ms) และถ้าหักต้นทุนคงที่ของ spawn ออก (~30ms) ส่วนที่เหลือ (422-30)/(34-30) ≈ 98 เท่า ใกล้เคียง 100 เท่าของขนาด corpus มาก — ยืนยันว่าไม่มี index ใดๆ ช่วยลดงานต่อ query เลย ทุก query คือ O(ขนาด corpus) เสมอ

---

## W1-6 — สรุป

**ripgrep ตอบโจทย์ query ที่ใช้คำตรงตัวได้ดีมาก** (`exact`, `keyword`, `filtered` recall ≥ 0.90) โดยไม่ต้องมี index ใดๆ เลย ต้นทุนที่จ่ายคือ latency ที่โตเป็นเส้นตรงกับขนาด corpus (ยืนยันด้วยตัวเลขจริงข้างบน) และคะแนนที่มี **length bias** ชัดเจน (เคส `structure/module-order.md` แพ้ note ยาวที่เกี่ยวข้องน้อยกว่า)

**จุดที่ ripgrep แพ้ขาดคือ semantic query** (recall 0.07) — เพราะไม่มีความเข้าใจความหมายเลย มีแค่ literal substring matching เท่านั้น

ripgrep ยังเป็น **post-filter** เท่านั้น (filter ไม่ได้ลด latency แม้แต่นิดเดียว — วัดจริงแล้วต่างกันแค่ 0.1ms) ซึ่งหมายความว่าที่ corpus ใหญ่ขึ้น การ filter จะไม่ช่วยอะไรเลยในแง่ความเร็ว

### คำถามที่ WS02 (SQLite FTS5) ต้องตอบ

1. index ช่วยลด latency ได้จริงแค่ไหน เทียบกับ 29.95ms p50 ที่ ripgrep ทำได้ตอนนี้?
2. BM25 แก้ length bias ที่เห็นในเคส `structure/module-order.md` ได้จริงไหม?
3. filter ในระดับ SQL (`WHERE layer = ?`) ทำให้ query แคบเร็วขึ้นจริงหรือแค่ในทางทฤษฎี — ต่างจาก post-filter ของ ripgrep แค่ไหน?
4. "index stale" คือปัญหาอะไร และต้นทุนที่ต้องจ่ายเพื่อให้ index ไม่ stale คือเท่าไหร่ (เทียบกับ ripgrep ที่ไม่มีปัญหานี้เลยเพราะไม่มี index ให้ stale)?
