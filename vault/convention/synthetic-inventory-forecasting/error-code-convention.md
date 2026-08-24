---
layer: convention
tags: [error, api]
created: 2026-05-30
links:
  - "[[convention/synthetic-inventory-forecasting/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`FCST_<DOMAIN>_<REASON>` เช่น `FCST_FEATURE_STALE`, `FCST_REPLENISH_APPROVAL_REQUIRED` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`FCST_MODEL_TIMEOUT`, `FCST_ANOMALY_THRESHOLD_INVALID`, `FCST_OVERRIDE_EXPIRED` — ดูรายชื่อเต็มที่ [[convention/synthetic-inventory-forecasting/api-response-format]]
