---
layer: structure
tags: [parsing, module, reference, identifiers]
created: 2026-05-07
links:
  - "[[structure/synthetic-recruitment-ats/module-resume-parser]]"
  - "[[business-logic/synthetic-recruitment-ats/auto-screen-decision-policy]]"
---

# resume-parser — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด resume-parser สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-recruitment-ats/module-resume-parser]])

## Public functions
- `parseResume(fileId: string, format: "pdf" | "docx"): Promise<ParsedResume>` — แกะข้อมูลจากไฟล์ resume ดิบเป็น structured field
- `extractWorkHistory(text: string): WorkHistoryEntry[]` — แกะประวัติการทำงานจากข้อความที่ OCR/parse ได้แล้ว
- `computeConfidenceScore(parsed: ParsedResume): number` — คำนวณความมั่นใจของผลแกะข้อมูล ใช้ตัดสินว่าต้องให้คนตรวจซ้ำหรือไม่

## Internal constants
- `LOW_CONFIDENCE_THRESHOLD = 0.6`
- `PARSE_TIMEOUT_MS = 20000`
- `SUPPORTED_LOCALES = "th, en"`

## Type

```ts
interface ParsedResume {
  fileId: string;
  candidateId: string;
  workHistory: WorkHistoryEntry[];
  skills: string[];
  confidenceScore: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-recruitment-ats/auto-screen-decision-policy]]
