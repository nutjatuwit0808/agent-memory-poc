---
layer: structure
tags: [ingest, module, core, reference, identifiers]
created: 2026-03-23
links:
  - "[[structure/synthetic-analytics-pipeline/module-ingest-connector]]"
  - "[[business-logic/synthetic-analytics-pipeline/extract-retry-policy]]"
---

# ingest-connector — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด ingest-connector สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-analytics-pipeline/module-ingest-connector]])

## Public functions
- `runExtract(sourceId: string, mode: "full" | "incremental"): Promise<ExtractRun>` — ดึงข้อมูลจากต้นทาง คืนผลว่าดึงได้กี่แถว สำเร็จหรือล้มเหลวบางส่วน
- `registerSource(config: SourceConfig): Promise<string>` — ลงทะเบียนระบบต้นทางใหม่ คืน sourceId
- `pauseSource(sourceId: string, reason: string): Promise<void>` — หยุดดึงข้อมูลจากต้นทางชั่วคราว เช่น ตอนต้นทางแจ้งปิดปรับปรุง

## Internal constants
- `EXTRACT_MAX_RETRY_ATTEMPTS = 3`
- `EXTRACT_TIMEOUT_MS = 600000`
- `RATE_LIMIT_BACKOFF_BASE_MS = 2000`

## Type

```ts
interface ExtractRun {
  runId: string;
  sourceId: string;
  status: "succeeded" | "failed_partial" | "failed_full";
  rowCount: number;
  extractedAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-analytics-pipeline/extract-retry-policy]]
