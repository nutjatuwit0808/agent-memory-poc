---
layer: structure
tags: [parsing, module]
created: 2025-09-09
links:
  - "[[structure/synthetic-recruitment-ats/service-boundaries]]"
  - "[[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]]"
  - "[[business-logic/synthetic-recruitment-ats/auto-screen-decision-policy]]"
---

# Module: resume-parser

แกะข้อมูล resume ดิบ (PDF/DOCX) ให้เป็น structured field เช่น ประวัติการทำงาน, ทักษะ, การศึกษา ทำงานเป็น async job แยกจาก upload flow เพื่อไม่ให้ผู้สมัครต้องรอผลแกะข้อมูลตอนอัปโหลด ผลลัพธ์ที่ได้ถูกใช้เป็น input ให้ auto-screen ตัดสินใจเบื้องต้นเท่านั้น ไม่ใช่การตัดสินใจสุดท้าย

## ฟังก์ชันหลัก
- `parseResume(fileId: string, format: "pdf" | "docx"): Promise<ParsedResume>` — แกะข้อมูลจากไฟล์ resume ดิบเป็น structured field
- `extractWorkHistory(text: string): WorkHistoryEntry[]` — แกะประวัติการทำงานจากข้อความที่ OCR/parse ได้แล้ว
- `computeConfidenceScore(parsed: ParsedResume): number` — คำนวณความมั่นใจของผลแกะข้อมูล ใช้ตัดสินว่าต้องให้คนตรวจซ้ำหรือไม่

## ความสัมพันธ์กับ module อื่น

ไม่รู้จักสถานะ pipeline เลย (ดู [[structure/synthetic-recruitment-ats/service-boundaries]]) — เมื่อแกะข้อมูลเสร็จจะ publish event `resume.parsed` เท่านั้น ปล่อยให้ [[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]] เป็นคนตัดสินใจว่าจะ advance stage อัตโนมัติหรือไม่ตาม [[business-logic/synthetic-recruitment-ats/auto-screen-decision-policy]]
