# memory-workshop

Case study สำหรับเรียนรู้กลไกการจัดการ memory ของ agent ด้วยการเขียนเองทุกบรรทัด — เปรียบเทียบ search backend 3 แบบ (ripgrep, SQLite FTS5, vector embedding) บน vault เดียวกัน ด้วยตัวเลขจริง ไม่ใช่ทฤษฎี

รายละเอียดเป้าหมาย/หลักการออกแบบ/กติกาทั้งหมด: [`CLAUDE.md`](CLAUDE.md) · สถานะงานทั้งหมด: [`CHECKLIST.md`](CHECKLIST.md)

## เครื่องที่วัดตัวเลขทั้งโปรเจกต์

Node.js v26.2.0, Windows 11 Home (10.0.26200), Intel(R) Core(TM) Ultra 7 265 — วันที่ 2026-08-22, vault 55 notes (161,968 bytes)

## เริ่มต้นใช้งาน

```bash
npm install
npm run reindex -- --full   # build SQLite FTS5 index จากศูนย์
npm run bench                # รันทุก backend เทียบกัน พิมพ์ตาราง markdown
npm run test                  # unit test ของ query classifier + RRF
npm run typecheck
```

**ต้องมี `rg` (ripgrep) อยู่ใน PATH ก่อนรัน bench** — ถ้าไม่มี `RipgrepBackend` จะ error พร้อมคำสั่งติดตั้งตาม OS

## Workshop ทั้ง 4 บท

| # | โฟกัส | สิ่งที่พบ | README |
|---|---|---|---|
| 01 | ripgrep — search ไม่มี index | Latency โตเชิงเส้นตามขนาด corpus (34ms→422ms ที่ 55→5,500 ไฟล์), semantic recall พังที่ 0.07 | [workshops/01-ripgrep](workshops/01-ripgrep/README.md) |
| 02 | SQLite FTS5 — inverted index + BM25 | เร็วกว่า ripgrep ~427 เท่า, break-even < 1 query, tokenizer มาตรฐานตัดคำไทยไม่ได้ | [workshops/02-fts5-index](workshops/02-fts5-index/README.md) |
| 03 | Vector embedding — semantic search | semantic recall 0.07→0.67, แต่ exact/identifier recall ร่วงเหลือ 0.47, LanceDB default (IVF_PQ) ทำ recall ANN เหลือ 0.20 ที่ 100k เวกเตอร์ | [workshops/03-vector-search](workshops/03-vector-search/README.md) |
| 04 | Hybrid router — route/fuse | route ได้ recall 0.87 (เกือบเท่า fuse 0.92) ที่ latency ต่ำกว่า fuse ~209 เท่า | [workshops/04-hybrid-router](workshops/04-hybrid-router/README.md) |

## ตารางสรุปสุดท้าย (จาก `npm run bench` จริง)

| backend | p50 (ms) | p95 (ms) | recall@5 | precision@5 | MRR | build (ms) | index size (bytes) | ชนะที่ query kind |
|---|---|---|---|---|---|---|---|---|
| ripgrep | 29.3–32.9 | 32.7–52.5 | 0.74 | 0.27 | 0.71 | 0 | 0 | `exact` (1.00) |
| fts5 | 0.06–0.07 | 0.15–0.17 | 0.72 | 0.25 | 0.75 | ~3 | 671,744 | `keyword` (1.00) |
| vector | 0.14 | 0.30 | 0.78 | 0.26 | 0.79 | ~15–20 | 350,208 | `semantic` (0.67) |
| **router (route)** | **0.19–0.20** | 29.7–30.7 | **0.87** | 0.30 | 0.79 | ~15–17 | 1,021,952 | ผสมตามกฎ deterministic |
| **router (fuse)** | 29.1–29.4 | 32.7–33.2 | **0.92** | **0.33** | **0.93** | ~15 | 1,021,952 | recall สูงสุด แลกด้วย latency 209× |

recall/precision/MRR reproducible 100% ทุกครั้งที่รัน (deterministic ตาม CLAUDE.md §2.1) — latency แกว่ง ±5–15% ตามปกติของการวัด wall-clock

## สรุปสั้น — เลือกอะไรตอนไหน

- **ไม่มี backend ไหนชนะทุกอย่าง** — ripgrep ชนะ `exact`, fts5 เร็วสุดและกว้างสุด, vector ชนะ `semantic`, ไม่มีตัวไหนแก้ length bias หรือปัญหาภาษาไทยได้สมบูรณ์คนเดียว
- ที่ vault ขนาดเล็ก (หลักสิบ-ร้อยไฟล์) **FTS5 เดี่ยวๆ คือจุดเริ่มต้นที่คุ้มที่สุด** — ต้นทุน setup ต่ำ เร็วที่สุด recall รวมใกล้เคียง ripgrep
- ถ้าต้องการ semantic เพิ่มโดยไม่แลก latency มาก **router (route)** คุ้มค่าความซับซ้อนชัดเจน (recall +11.5% จาก backend เดี่ยวที่ดีที่สุด แลก latency แค่เศษเสี้ยว ms ส่วนใหญ่)
- **router (fuse)** เหมาะกับงานที่ไม่ sensitive ต่อ latency (batch/report) ไม่ใช่ user-facing search แบบ real-time
- **ANN (LanceDB) ยังไม่คุ้มที่ scale นี้เลย** — brute-force เร็วกว่าและแม่นกว่าเสมอจนกว่าจะถึงหลักหมื่นเวกเตอร์ขึ้นไป และต้องระวัง default `IVF_PQ` ที่แลก recall ไปกับพื้นที่โดยไม่บอกตรงๆ

รายละเอียดตัวเลข เคสจริง และเหตุผลเบื้องหลังทุกการตัดสินใจอยู่ใน README ของแต่ละ workshop ด้านบน
