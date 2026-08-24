---
layer: structure
tags: [ingest, module, core]
created: 2026-01-10
links:
  - "[[business-logic/synthetic-analytics-pipeline/extract-retry-policy]]"
  - "[[structure/synthetic-analytics-pipeline/module-transform-engine]]"
  - "[[structure/synthetic-analytics-pipeline/queue-architecture]]"
---

# Module: ingest-connector

เชื่อมต่อระบบต้นทางหลากหลายชนิด (ฐานข้อมูล, SaaS API, ไฟล์ที่อัปโหลด) แล้วดึงข้อมูลดิบเข้ามาเก็บใน `raw_extracts` โดยไม่แปลงรูปใดๆ แยกออกมาเป็น service อิสระตั้งแต่ต้นเพราะแต่ละ connector มีจังหวะความล้มเหลวและ rate limit ต่างกันมาก การรวม logic ไว้ใน service เดียวทำให้ connector หนึ่งล่มแล้วดึงตัวอื่นไม่ได้ไปด้วย

## ฟังก์ชันหลัก
- `runExtract(sourceId: string, mode: "full" | "incremental"): Promise<ExtractRun>` — ดึงข้อมูลจากต้นทาง คืนผลว่าดึงได้กี่แถว สำเร็จหรือล้มเหลวบางส่วน
- `registerSource(config: SourceConfig): Promise<string>` — ลงทะเบียนระบบต้นทางใหม่ คืน sourceId
- `pauseSource(sourceId: string, reason: string): Promise<void>` — หยุดดึงข้อมูลจากต้นทางชั่วคราว เช่น ตอนต้นทางแจ้งปิดปรับปรุง

## State

queued → extracting → succeeded | failed_partial (ดึงได้บางส่วน) | failed_full — ดู [[business-logic/synthetic-analytics-pipeline/extract-retry-policy]] สำหรับเงื่อนไขว่าเมื่อไหร่ retry เมื่อไหร่ escalate

## ความสัมพันธ์กับ module อื่น

ไม่คุยกับ [[structure/synthetic-analytics-pipeline/module-transform-engine]] โดยตรง — ข้อมูลดิบที่ดึงสำเร็จจะ publish event `extract.completed` เข้า queue กลางเท่านั้น (ดู [[structure/synthetic-analytics-pipeline/queue-architecture]]) เพื่อรักษาหลัก separation of concerns ไม่ให้ ingest layer รู้จัก logic การแปลงข้อมูลเลย
