---
layer: convention
tags: [error, api]
created: 2026-03-29
links:
  - "[[convention/synthetic-fraud-detection/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`SAI_<DOMAIN>_<REASON>` เช่น `SAI_SIGNAL_SCHEMA_INVALID`, `SAI_SCORE_TIMEOUT`, `SAI_CASE_NOT_FOUND` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`SAI_RULE_OVERRIDE_DENIED`, `SAI_SLA_BREACHED`, `SAI_DEVICE_UNTRUSTED`, `SAI_VELOCITY_EXCEEDED` — ดูรายชื่อเต็มที่ [[convention/synthetic-fraud-detection/api-response-format]]
