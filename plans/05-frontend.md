# Workshop 05 — Frontend comparison UI

## คำถามตั้งต้น

- ความต่างที่ `bench` วัดได้ **มองเห็นด้วยตาตอนพิมพ์ query เองได้ไหม** — หรือเห็นแค่ในตัวเลขเฉลี่ย
- ผลลัพธ์ที่ backend หนึ่งเจอแต่อีกตัวไม่เจอ คือไฟล์ไหนบ้าง (ตัวเลข recall เฉลี่ยซ่อนเรื่องนี้ไว้)
- latency ที่ user **รู้สึกจริง** ต่างจาก engine latency แค่ไหน — HTTP + render กลบอะไรไปบ้าง

## ทฤษฎีสั้น (เขียนลง README ตอนทำ)

`bench` วัดค่าเฉลี่ยจาก query set ตายตัว 20 ข้อ → เห็นภาพรวมแต่ไม่เห็นเคสเฉพาะที่ผู้เรียนสงสัยเอง
UI แบบ side-by-side ทำให้เห็นสิ่งที่ตัวเลขเฉลี่ยซ่อนไว้: **ผลลัพธ์ที่ต่างกันจริงต่อ query เดียว**

**กับดักที่ต้องระวังที่สุด:** ถ้าจับเวลาฝั่ง browser จะได้ HTTP + JSON + React render รวมมาด้วย ซึ่งอยู่ราว 5–20ms — ใหญ่กว่า engine time ของ fts5 (0.06ms) **หลายร้อยเท่า** ผลคือ UI จะแสดงว่า fts5 กับ ripgrep เร็วพอกัน ซึ่ง**สอนผิดโดยสิ้นเชิง** ต้องวัด engine time ฝั่ง server รอบ `backend.search()` เท่านั้น แล้วส่งกลับมาแสดงแยกจาก round-trip

---

## Decisions — ตัดสินครบแล้ว (2026-08-22)

### D-6 ✅ ตัดสินแล้ว: **Next.js + React** (แยก `package.json` ไว้ใน `web/`)

ยอมรับว่าเป็น dependency ก้อนใหญ่ที่สุดที่โปรเจกต์เคยเพิ่ม และไม่เกี่ยวกับกลไก memory โดยตรง — แลกกับการได้ฝึก Next และมี dev server/HMR พร้อมใช้
*(ทางที่ไม่เลือก: HTML + `fetch` ไฟล์เดียว dependency = 0 แต่ไม่ได้ฝึก Next และต้องเขียน DOM manipulation เอง)*
**ผลที่ตามมา:** ต้องแยก `package.json` เด็ดขาด ไม่ให้ Next/React ปนกับ root ที่ตั้งใจให้เล่าลำดับ workshop ได้ด้วยตัวเอง

### D-7 ✅ ตัดสินแล้ว: **แยก process ผ่าน HTTP**

### D-8 ✅ ตัดสินแล้ว: **CSS ธรรมดา** — ไม่เพิ่ม Tailwind/config อีกชั้น

---

### เหตุผลเต็มของ D-7 — แยก process vs import ตรง

**ปัญหาจริงที่ตรวจสอบแล้ว:** 6 ไฟล์ใน `src/` ผูก path กับ `import.meta.url`
(`embedder.ts`, `embedding-cache.ts`, `reindex-core.ts`, `sqlite-db.ts`, `backends/index.ts`, `bench.ts`)
ถ้า Next bundle เข้า `.next/server/` → `__dirname` ย้ายที่ → **หา `vault/`, `data/index.sqlite`, `data/models/` ไม่เจอทั้งหมด**

| ทาง | ผล |
|---|---|
| **A. แยก process** ✅ เลือกทางนี้ | `src/cli/serve.ts` เป็น HTTP server (ใช้ `node:http` — 0 dependency) แล้ว Next เรียกผ่าน `fetch` · โค้ดเดิม**ไม่ต้องแตะแม้แต่บรรทัดเดียว** · ไม่ต้องยุ่ง `serverExternalPackages`/native binding · แลกกับต้องรัน 2 process |
| B. import ตรงใน API route | ต้องตั้ง `serverExternalPackages` ให้ `better-sqlite3`, `onnxruntime-node`, `@lancedb/lancedb` **และต้องแก้ path resolution ทั้ง 6 ไฟล์** ให้เลิกใช้ `__dirname` — คือการรื้อโค้ด workshop เพื่อรองรับ UI ซึ่งขัดหลัก CLAUDE.md §2.4 |

---

## ขอบเขต — เส้นที่ห้ามข้าม

`web/` **ห้าม import อะไรจาก `src/` ทั้งสิ้น ยกเว้น type** — ทุกการค้นหาต้องผ่าน HTTP เท่านั้น
ถ้า frontend เริ่มคำนวณคะแนน จัดอันดับ หรือ merge ผลเอง = **ผิดทันที** เพราะตัวเลขที่โชว์จะไม่ใช่ตัวเลขของ backend จริงอีกต่อไป UI เป็นแค่ "หน้าต่างมอง" ไม่ใช่ที่เก็บ logic

---

## W5-1 — Search server (`src/cli/serve.ts`)

**ทำ:** HTTP server ด้วย `node:http` ครอบ backend ทั้ง 5 ตัวที่ register ไว้ใน `backends/index.ts` อยู่แล้ว

**API — 1 request ต่อ 1 backend (ตั้งใจ ไม่ใช่ยิงรวม):**
```
GET /api/search?backend=fts5&q=...&layer=...&tags=a,b&limit=10
GET /api/backends          -> รายชื่อ backend + stats()
GET /api/queries           -> ส่ง bench/queries.json ให้ UI ใช้เป็น preset
```

ให้ browser ยิง 5 requests ขนานกัน → **คอลัมน์จะโผล่ไม่พร้อมกัน** (fts5 มาก่อน ripgrep ทีหลัง) — ความไม่พร้อมกันนี้**คือบทเรียน** ถ้ายิงรวมเป็น request เดียวทุกคอลัมน์จะรอตัวช้าสุดเท่ากันหมด แล้วความต่างจะหายไป

**Warm-up ตอน startup (สำคัญมาก):** ต้อง `index()` ทุก backend + **ยิง query หลอก 1 ครั้ง** ก่อนเปิดรับ request
เพราะ W3-1 พบว่า single-query embed ครั้งแรกหลัง `index()` ใช้เวลา **~1,250ms** (ONNX compile execution graph ตาม input shape ใหม่) ถ้าไม่ warm ผู้ใช้คนแรกจะเห็น vector ช้ากว่าความจริง 100 เท่า

**Response ต้องมี:**
```jsonc
{
  "backend": "fts5",
  "engineMs": 0.062,              // จับรอบ backend.search() เท่านั้น
  "results": [{ "id": "...", "score": 1.4, "matchedBy": "fts", "layer": "...", "excerpt": "..." }],
  "routedBy": "short-keyword",    // เฉพาะ router-route (จาก getLastRouting())
  "timing": { "embedQueryMs": 8.1, "searchMs": 0.14 }  // เฉพาะ vector
}
```

**DoD**
- [ ] ไม่แก้ไฟล์เดิมใน `src/` เลยแม้แต่ไฟล์เดียว (เพิ่ม `serve.ts` อย่างเดียว)
- [ ] `npm run serve` เปิดเซิร์ฟเวอร์ + warm-up ครบก่อนรับ request แรก
- [ ] `engineMs` จับรอบ `search()` เท่านั้น ไม่รวม JSON serialize/HTTP
- [ ] preflight: ถ้า `rg` ไม่มีใน PATH → error ชัดเจนตอน startup ไม่ใช่ตอน request แรก
- [ ] มี `?repeat=20` ให้วัด p50/p95 ฝั่ง server ด้วยวิธีเดียวกับ `bench.ts` (warmup 3 + วัด 20)

---

## W5-2 — Next.js scaffold (`web/`)

**ทำ:** Next.js app ใน `web/` **แยก `package.json` ของตัวเอง** — ไม่ปนกับ root

เหตุผลที่แยก: `00-foundation.md` ตั้งใจให้ `package.json` เล่าลำดับ workshop ได้ด้วยตัวเอง (`tsx`/`zod`/`yaml` → `better-sqlite3` → `transformers` → `lancedb`) ถ้าเอา Next ยัดเข้าไปด้วย เรื่องเล่านั้นจะพัง

**DoD**
- [ ] `web/package.json` แยก — root `package.json` ไม่มี Next/React เพิ่มเข้ามาเลย
- [ ] `web/` ไม่ import อะไรจาก `src/` ยกเว้น type (ตรวจด้วย grep)
- [ ] `.gitignore` ครอบ `web/.next/`, `web/node_modules/`
- [ ] เอกสารบอกชัดว่าต้องรัน 2 process (`npm run serve` + `cd web && npm run dev`)

---

## W5-3 — หน้าเปรียบเทียบหลัก

**ทำ:** ช่องพิมพ์ 1 ช่อง → 5 คอลัมน์เรียงกัน (ripgrep / fts5 / vector / router-route / router-fuse)

**แต่ละคอลัมน์:** ชื่อ backend · engine ms · round-trip ms · top-5 (score + `matchedBy`)
**แถบอธิบายด้านบน:** "engine time ต่างกันเป็นร้อยเท่า แต่ round-trip เกือบเท่ากัน เพราะ HTTP+render กลบ" — ต้องเขียนให้ผู้ใช้เห็น ไม่ใช่ปล่อยให้ตีความเอง

**ไฮไลต์ผลที่ไม่ซ้ำกัน** — ผลที่มีเฉพาะบาง backend ต้องมีสีต่างจากผลที่เจอเหมือนกันหลายตัว
นี่คือฟีเจอร์สำคัญที่สุดของหน้านี้: ทำให้เห็นด้วยตาว่า vector เจอ `case-3401.md` ที่ ripgrep ไม่เจอ

**DoD**
- [ ] debounce การพิมพ์ + `AbortController` ยกเลิก request เก่า (ripgrep spawn subprocess ทุกครั้ง — ปล่อยให้กองได้)
- [ ] แสดง engine ms กับ round-trip ms **แยกกันเสมอ** พร้อมคำอธิบายว่าต่างกันเพราะอะไร
- [ ] คอลัมน์ที่ยังไม่เสร็จแสดง loading — เห็นชัดว่า fts5 เสร็จก่อน ripgrep
- [ ] ผลที่ unique ต่อ backend มีสีต่างจากผลที่ซ้ำกัน
- [ ] vector แสดง `embedQueryMs` แยกจาก `searchMs` (ความช้าอยู่ที่ embed ไม่ใช่ search)

---

## W5-4 — Ground truth overlay (จุดขายของ workshop นี้)

**ทำ:** ดึง 20 query จาก `bench/queries.json` มาเป็นปุ่ม preset — คลิกแล้ว **UI รู้คำตอบที่ถูกอยู่แล้ว**

- ผลที่อยู่ใน `relevant` → ติ๊ก ✓ · ผลที่ไม่อยู่ → เว้นว่าง
- คำนวณ recall@5 สดต่อ backend ต่อ query แล้วโชว์ข้างชื่อคอลัมน์
- แสดง `kind` ของ query (`exact`/`keyword`/`semantic`/`filtered`) กำกับไว้

ผลที่ควรเห็นทันทีเมื่อกด `q-semantic-*`: vector ติ๊กเขียว ส่วน ripgrep/fts5 ว่างเปล่า (recall 0.67 vs 0.07 จาก WS03)
และกด `q-exact-*` จะเห็นภาพกลับด้าน (1.00 vs 0.47) — **สลับกันแพ้ชนะให้เห็นภายในสองคลิก**

**DoD**
- [ ] preset ครบทั้ง 20 query แยกกลุ่มตาม `kind`
- [ ] recall@5 ที่คำนวณสดตรงกับตัวเลขใน README ของ WS01–04
- [ ] มีอย่างน้อย 1 เคสที่ vector ชนะ และ 1 เคสที่ vector แพ้ ชี้ให้เห็นได้จากปุ่มเดียว

---

## W5-5 — Filter + router explainer

**ทำ:** dropdown `layer` + ช่อง `tags` → เห็นผลของ pre-filter vs post-filter จาก WS04

- แสดง engine ms เทียบก่อน/หลังใส่ filter ต่อ backend
- ผลที่คาด (จาก W4-2): ripgrep แทบไม่ลด (post-filter) · fts5 ลดเล็กน้อย · **vector ลด ~53%**

**Router explainer:**
- `router-route` → โชว์ `routedBy` + เหตุผลของกฎนั้น (มีใน `CLASSIFICATION_RULES[].reason` แล้ว)
- `router-fuse` → ตาราง RRF: อันดับจากแต่ละ backend → `1/(60+rank)` → ผลรวม (สูตรคำนวณตามด้วยมือได้ตาม CLAUDE.md §2.1)

**DoD**
- [ ] filter ส่งเป็น `SearchQuery` ตรงๆ ไม่แปลงความหมายระหว่างทาง
- [ ] `routedBy` แสดงทุกครั้งที่ใช้ router-route
- [ ] ตาราง RRF แสดงเลขจริงที่บวกกันได้ตรงกับ score สุดท้าย

---

## W5-6 — README + ยืนยันขอบเขต

**ไฟล์:** `workshops/05-frontend/README.md` ตามโครง CLAUDE.md §5

**DoD**
- [ ] ครบ 5 หัวข้อตามโครง + screenshot ของเคสที่ backend ให้ผลต่างกันชัด
- [ ] ยืนยัน `src/` เดิมไม่ถูกแก้เลย (เทียบ mtime เหมือนที่ทำตอนจบ WS04)
- [ ] ยืนยัน `web/` ไม่มี logic การค้นหา/จัดอันดับ (grep หา `cosine`, `bm25`, `sort` ในโฟลเดอร์ `web/`)
- [ ] บันทึกว่า UI ทำให้เข้าใจอะไรที่ตาราง bench ไม่ได้บอก — ถ้าตอบไม่ได้ แปลว่า workshop นี้ไม่คุ้มที่จะมี
