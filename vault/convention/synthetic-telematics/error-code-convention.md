---
layer: convention
tags: [error, api]
created: 2026-01-04
links:
  - "[[convention/synthetic-telematics/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`DLOG_<DOMAIN>_<REASON>` เช่น `DLOG_TRIP_INCOMPLETE`, `DLOG_DEVICE_INACTIVE` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`DLOG_SCORE_STALE`, `DLOG_PREMIUM_CAP_EXCEEDED`, `DLOG_GEOFENCE_COOLDOWN_ACTIVE` — ดูรายชื่อเต็มที่ [[convention/synthetic-telematics/api-response-format]]
