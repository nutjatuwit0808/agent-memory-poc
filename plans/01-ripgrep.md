# Workshop 01 — ripgrep

## คำถามตั้งต้น

- search ทำงานได้ยังไงโดยไม่มี index เลย?
- latency จริงบน vault ขนาดนี้เท่าไหร่ และมันโตตามอะไร?
- ripgrep แพ้ตรงไหน — จุดไหนที่ทำให้ต้องมี index ใน WS02

## ทฤษฎีสั้น (เขียนลง README ตอนทำ)

ไม่มี index = ต้องอ่านทุกไฟล์ทุกครั้ง → ต้นทุน O(ขนาด corpus) ต่อ 1 query
ripgrep ชนะ `grep` ธรรมดาด้วย 3 อย่าง: literal prefilter (SIMD memchr), เดินไฟล์แบบ parallel, และข้ามไฟล์ที่ไม่ต้องอ่านตั้งแต่แรก
สิ่งที่มันทำไม่ได้: ไม่รู้ว่าคำไหนสำคัญ (ไม่มี IDF), ไม่รู้ว่าคำไหนแปลว่าอะไร (ไม่มี semantic)

---

## W1-1 — Spike: ripgrep availability + JSON shape

**D-2 ✅ ตัดสินแล้ว: system `rg` + spawn**
เหตุผล: zero dep ตรงกับ CLAUDE.md §6 (เลือก library ที่บางที่สุด) และทำให้เห็นชัดว่า search นี้คือการยิง subprocess จริงๆ ไม่ใช่ library call
*(ทางที่ไม่เลือก: `@vscode/ripgrep` ได้ binary แน่นอนทุกเครื่องแต่ +dep และ download ตอน install)*

**ราคาที่ต้องจ่ายจากการเลือกทางนี้:** ต้องมี preflight check ตอน startup — ถ้าไม่มี `rg` ให้ error บอกวิธีติดตั้งต่อ OS ไม่ใช่ปล่อยให้ spawn fail แบบอ่านไม่รู้เรื่อง

**ทำ:** ยืนยันว่ามี `rg`, จด version, ดูโครง `--json` output ว่ามี event type อะไรบ้าง (`begin` / `match` / `end` / `summary`)

**DoD**
- [ ] จด `rg --version` ลง README
- [ ] มีตัวอย่าง JSON 1 record ของแต่ละ event type ใน README
- [ ] preflight check + error message ที่บอกวิธีติดตั้ง
- [ ] จดว่า rg เวอร์ชันต่างกันมีผลกับ JSON schema ไหม (ถ้าไม่รู้ ให้ pin เวอร์ชันขั้นต่ำไว้)

---

## W1-2 — ripgrep.backend.ts

**ไฟล์:** `src/search/backends/ripgrep.backend.ts`

**ทำ:**
- `index()` → no-op (CLAUDE.md §4.2 อนุญาตไว้) แต่ **ใส่ comment อธิบายว่าทำไมถึงว่างได้** — จุดนี้คือแก่นของ workshop
- `search()` → spawn `rg --json --smart-case --type md <pattern> vault/` → parse ทีละบรรทัด → map เป็น `SearchResult`
- `stats()` → indexedCount = จำนวน note, sizeBytes = 0, buildTimeMs = 0 (**ไม่มี index จริงๆ — ต้องเป็น 0 ไม่ใช่ตัวเลขปลอม**)

**Escape:** query ของผู้ใช้ต้องถูก escape ก่อนส่งเข้า rg ไม่งั้นตัวอักษรอย่าง `(` `.` `*` จะถูกตีเป็น regex — ใช้ `-F` (fixed string) เป็น default แล้วเปิด regex เป็น opt-in

**DoD**
- [ ] implement ครบ 3 method ตาม interface ไม่แก้ signature
- [ ] query ที่มีอักขระ regex ไม่พังและไม่ให้ผลเพี้ยน
- [ ] คืน `matchedBy: "keyword"` ทุกผลลัพธ์
- [ ] ไม่ import อะไรจาก `core/` นอกจาก type

---

## W1-3 — Scoring

**ทำ:** สูตรคะแนนที่อ่านออกและคำนวณตามได้ด้วยมือ (CLAUDE.md §2.1)

เริ่มจากสูตรง่ายสุด แล้วจดว่าทำไมมันไม่พอ:

```
score = matchCount + (exactPhraseMatch ? 5 : 0) + (matchInTitle ? 3 : 0)
```

**สิ่งที่ต้องจดลง README:** สูตรนี้ไม่มี normalization ตามความยาว → note ยาวได้เปรียบเสมอ นี่คือปัญหาที่ BM25 ใน WS02 แก้ให้ ให้ **โชว์เคสจริงจาก vault** ที่ note ยาวชนะทั้งที่ไม่เกี่ยว

**DoD**
- [ ] สูตรอยู่ในที่เดียว มี comment อธิบายทุกพจน์ว่าทำไมมีน้ำหนักเท่านั้น
- [ ] มีเคสจริงใน README ที่แสดงว่า length bias เกิดขึ้นจริง

---

## W1-4 — Filter: layer / tags

**ทำ:** post-filter หลังได้ผลจาก rg โดยใช้ metadata จาก vault-reader

จดลง README ว่านี่คือ **post-filter** ไม่ใช่ pre-filter — rg ยังอ่านทุกไฟล์อยู่ดี งานที่ไม่จำเป็นถูกทำไปแล้ว ต่างจาก WS02 ที่กรองได้ใน SQL ก่อนค้น และเป็นเหตุผลของ layer pre-filter ใน WS04

**DoD**
- [ ] `layer` filter ทำงานถูก
- [ ] `tags` filter = AND (ระบุให้ชัดใน README ว่าเลือก AND ไม่ใช่ OR เพราะอะไร)
- [ ] `limit` ทำงานหลัง sort แล้ว
- [ ] วัด latency เทียบ มี filter vs ไม่มี filter → ยืนยันว่าเกือบเท่ากัน (พิสูจน์ว่าเป็น post-filter จริง)

---

## W1-5 — วัดผล

**ทำ:** `npm run bench --backend=ripgrep` แล้วบันทึกตัวเลขจริงลง README

**ต้องมีในตาราง:** p50/p95 แยกตาม query kind, recall@5, precision@5, และ **latency vs vault size** — ลองรันบน vault 25% / 50% / 100% เพื่อยืนยันว่าโตแบบเชิงเส้น (นี่คือหลักฐานว่าไม่มี index จริง)

**DoD**
- [ ] ตัวเลขจากการรันจริง มี timestamp + spec เครื่อง
- [ ] มีกราฟ/ตาราง latency vs corpus size
- [ ] ระบุว่า query kind ไหนที่ ripgrep recall ต่ำ (คาดว่า `semantic`)

---

## W1-6 — README

**ไฟล์:** `workshops/01-ripgrep/README.md` ตามโครง CLAUDE.md §5

**DoD**
- [ ] ครบ 5 หัวข้อตามโครง
- [ ] ทฤษฎีไม่เกินครึ่งหน้า
- [ ] สรุปมาจากตัวเลข ไม่ใช่จากทฤษฎี
- [ ] ปิดท้ายด้วยคำถามที่ WS02 ต้องตอบ (ส่งไม้ต่อ)
