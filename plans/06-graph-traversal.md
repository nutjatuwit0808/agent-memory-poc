# Workshop 06 — Graph traversal (ใช้ wikilink ที่มีอยู่แล้ว)

## คำถามตั้งต้น

- เอกสารที่ถูกต้อง **อยู่ห่างจากผลลัพธ์อันดับ 1 แค่ 1 hop** หรือเปล่า
- link graph ที่ `core/` parse เก็บไว้ตั้งแต่ P0-3 แต่ **ไม่มี backend ไหนแตะเลยตลอด WS01–05** มีค่าจริงไหม
- multi-hop query (ที่ query set ปัจจุบัน **ไม่มีเลยสักข้อ**) backend เดิมทำได้แค่ไหน

## ทฤษฎีสั้น (เขียนลง README ตอนทำ)

WS01–05 ทุกตัวหาจาก "ความคล้ายกับ query" อย่างเดียว แต่ความรู้จริงในวอลต์**เชื่อมกันเป็นกราฟ** — `refund-policy.md` ชี้ไป `error-code-convention.md` ซึ่งชี้ต่อไป `module-refund.md` คำถามบางแบบต้องเดินตามเส้นเชื่อมถึงจะตอบได้ ไม่ใช่แค่หาเอกสารที่คล้าย query ที่สุด

**graph expansion:** เอา top-k จาก backend เดิมเป็น "เมล็ด" (seed) แล้วขยายออกไปตาม link 1–2 hop โดยให้คะแนนลดลงตามระยะ

**จุดต่างสำคัญจาก GraphRAG กระแสหลัก:** GraphRAG ทั่วไปสร้างกราฟด้วยการให้ **LLM สกัด entity/relation** จากข้อความ ซึ่ง **CLAUDE.md §1 ตัดทิ้งไปแล้ว** ("LLM extraction — ไม่ใช้") workshop นี้ใช้ wikilink ที่มนุษย์เขียนไว้เองตอนเขียน note จึงเป็นกราฟที่ **deterministic 100% และไม่ต้องเพิ่ม dependency สักตัว**

---

## ต้องตัดสินก่อนเริ่ม

### D-9 — hop limit และสูตรลดคะแนนตามระยะ

| ตัวเลือก | ผล |
|---|---|
| **1 hop, decay 0.5** ⭐ แนะนำเริ่มที่นี่ | ขยายน้อย เสี่ยง noise ต่ำ เห็นผลชัดว่ามาจาก link จริง |
| 2 hop, decay 0.5² | ครอบคลุมกว่า แต่ที่ vault 55 note อาจลากมาเกือบทั้งวอลต์จน precision พัง |

สูตรที่เสนอ: `score(note) = max(seedScore × decay^hop)` — ใช้ `max` ให้สอดคล้องกับ W3-2 ที่ตัดสินใช้ max ไปแล้ว

### D-10 — seed มาจาก backend ไหน

เสนอ **`router-route`** เป็น default (recall สูงสุดในบรรดาตัวที่เร็ว) แต่ต้องทำให้สลับได้เพื่อวัดว่า graph ช่วย backend ไหนมากที่สุด

---

## W6-1 — ขยาย query set ด้วย multi-hop (ต้องทำก่อน ห้ามข้าม)

**ปัญหาที่ต้องแก้ก่อน:** `bench/queries.json` ปัจจุบัน **ไม่มี multi-hop query เลยสักข้อ** — ถ้าไม่เพิ่ม จะวัดไม่เห็นประโยชน์ของ graph เลยไม่ว่า implement ดีแค่ไหน (และจะได้ข้อสรุปผิดว่า "graph ไม่ช่วย")

**ทำ:** เพิ่ม query kind ใหม่ `multi-hop` อย่างน้อย **5 ข้อ** ที่คำตอบต้องเดินผ่าน link เช่น
- "error code ที่ใช้ตอนคืนเงินซ้ำ ต้องเขียนตาม namespace อะไร" → ต้องผ่าน `refund-policy` → `error-code-convention`
- "ตอน incident refund ค้าง ต้องดู runbook ไหนและ threshold ตั้งที่เท่าไหร่" → ผ่าน `case-3401` → `refund-timeout-policy` → `env-variables-reference`

**DoD**
- [ ] เพิ่ม kind `multi-hop` ≥5 ข้อ พร้อม ground truth ที่ตัดสินด้วยคนอ่านเอง
- [ ] `relevant` ของแต่ละข้อต้องมี ≥2 ไฟล์ที่เชื่อมกันด้วย link จริง (ตรวจด้วย validator)
- [ ] **วัด baseline ก่อน:** backend เดิมทั้ง 5 ตัวได้ recall เท่าไหร่บน kind ใหม่นี้ — บันทึกไว้เทียบ
- [ ] query เดิม 20 ข้อยังให้ผลเท่าเดิมเป๊ะ (ไม่ไปแก้ของเก่า)

---

## W6-2 — สร้าง link graph

**ไฟล์:** `src/search/backends/link-graph.ts`

**ทำ:** สร้าง adjacency list จาก `note.links` ที่ `core/` parse ไว้แล้ว — **ห้ามแก้ `core/`** (freeze ตั้งแต่ P0)

ต้องตัดสินและจดไว้: กราฟเป็น **directed หรือ undirected** — `A → B` แปลว่า B เกี่ยวกับ A ด้วยไหม? (เสนอ: ทำ undirected เป็น default เพราะ backlink มีความหมายพอๆ กัน แต่ต้องวัดทั้งสองแบบ)

**DoD**
- [ ] คืน adjacency ทั้งไปและกลับ (forward link / backlink) แยกกันได้
- [ ] รายงานสถิติกราฟ: จำนวน edge, degree เฉลี่ย/สูงสุด, จำนวน note ที่ไม่มี link เลย (orphan)
- [ ] ตรวจ dangling link (ชี้ไปไฟล์ที่ไม่มีจริง) — WS01–05 เคยยืนยันว่าเป็น 0 ต้องยังเป็น 0
- [ ] pure function ทั้งหมด รับ `MemoryNote[]` เข้า ไม่อ่านไฟล์เอง

---

## W6-3 — `graph.backend.ts`

**ทำ:** implement `SearchBackend` โดยห่อ backend อื่นไว้ข้างใน (แบบเดียวกับ `RouterBackend`)

1. ขอ seed จาก inner backend (ตาม D-10)
2. ขยายไปตาม link ตาม D-9
3. รวมคะแนน — note ที่ถูกชี้จากหลาย seed ต้องได้คะแนนสะสม

**ต้อง log ได้ว่าแต่ละผลลัพธ์มาจากไหน** — `hop: 0` (seed ตรงๆ) หรือ `hop: 1 via <noteId>` เหมือนที่ `routedBy` ทำใน WS04 ไม่งั้นอธิบายไม่ได้ว่าทำไมไฟล์นี้ขึ้นมา

**DoD**
- [ ] implement 3 method ครบ **ไม่แก้ signature** `SearchBackend`
- [ ] `matchedBy` ใช้ค่าเดิมของ seed (ไม่เพิ่มค่าใหม่ใน type — `core/` freeze แล้ว)
- [ ] มี diagnostic method บอกที่มาของทุกผลลัพธ์ (hop + ผ่าน note ไหน)
- [ ] สูตรคะแนนอยู่ที่เดียว คำนวณตามด้วยมือได้

---

## W6-4 — วัดผล

**ต้องตอบให้ได้:**
- multi-hop recall ดีขึ้นกี่ % เทียบ baseline จาก W6-1
- **single-hop แย่ลงไหม** — คาดว่าแย่ลงเพราะ link ลากของไม่เกี่ยวเข้ามา (noise) **ถ้าไม่แย่ลงเลยต้องสงสัยว่าวัดผิด**
- latency เพิ่มเท่าไหร่ (คาดว่าน้อยมาก เพราะ traversal เป็น in-memory map lookup)

**DoD**
- [ ] ตารางแยก `multi-hop` vs kind เดิม — ต้องเห็นทั้งที่ชนะและที่แพ้
- [ ] เทียบ 1 hop vs 2 hop และ directed vs undirected ด้วยตัวเลขจริง
- [ ] ยกเคสจริงที่ graph ดึงเอกสารถูกขึ้นมาได้ทั้งที่ backend เดิมไม่เจอ พร้อมบอกว่ามาทาง link ไหน

---

## W6-5 — README

**DoD**
- [ ] ครบ 5 หัวข้อตาม CLAUDE.md §5
- [ ] อธิบายชัดว่าต่างจาก GraphRAG กระแสหลักยังไง (ไม่มี LLM extraction)
- [ ] ตอบให้ได้ว่า **กราฟที่คนเขียนเองด้วยมือ คุ้มกว่าหรือแย่กว่ากราฟที่ LLM สกัดให้** ในบริบทนี้
- [ ] `core/` ไม่ถูกแก้ (ยืนยันด้วย mtime)
