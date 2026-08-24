---
layer: convention
tags: [error, api]
created: 2026-05-28
links:
  - "[[convention/synthetic-analytics-pipeline/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`DATA_<DOMAIN>_<REASON>` เช่น `DATA_EXTRACT_CREDENTIAL_EXPIRED`, `DATA_SCHEMA_BREAKING_CHANGE` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`DATA_JOB_STUCK`, `DATA_QUALITY_CHECK_FAILED`, `DATA_LOAD_DUPLICATE_ROW` — ดูรายชื่อเต็มที่ [[convention/synthetic-analytics-pipeline/api-response-format]]
