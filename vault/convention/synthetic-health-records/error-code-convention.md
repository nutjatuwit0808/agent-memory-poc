---
layer: convention
tags: [error, api]
created: 2026-01-16
links:
  - "[[convention/synthetic-health-records/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`VITAL_<DOMAIN>_<REASON>` เช่น `VITAL_ACCESS_DENIED`, `VITAL_REFILL_LIMIT_EXCEEDED` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`VITAL_RECORD_VERSION_CONFLICT`, `VITAL_LAB_MATCH_AMBIGUOUS`, `VITAL_APPOINTMENT_SLOT_TAKEN` — ดูรายชื่อเต็มที่ [[convention/synthetic-health-records/api-response-format]]
