---
layer: convention
tags: [error, api]
created: 2025-10-01
links:
  - "[[convention/synthetic-customer-segmentation/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`SEG_<DOMAIN>_<REASON>` เช่น `SEG_EXPORT_STALE_MEMBERSHIP`, `SEG_SEGMENT_TOO_SMALL`, `SEG_PII_FIELD_DETECTED` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`SEG_INGEST_SCHEMA_MISMATCH`, `SEG_REFRESH_ALREADY_RUNNING`, `SEG_ATTRIBUTION_DUPLICATE_EVENT` — ดูรายชื่อเต็มที่ [[convention/synthetic-customer-segmentation/api-response-format]]
