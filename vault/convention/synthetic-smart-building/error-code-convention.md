---
layer: convention
tags: [error, api]
created: 2026-08-08
links:
  - "[[convention/synthetic-smart-building/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`ATR_<DOMAIN>_<REASON>` เช่น `ATR_HVAC_SENSOR_STALE`, `ATR_ACCESS_SCHEDULE_CONFLICT` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`ATR_OCCUPANCY_SENSOR_OFFLINE`, `ATR_MAINT_WORKORDER_REOPENED`, `ATR_ENERGY_OVERRIDE_ACTIVE` — ดูรายชื่อเต็มที่ [[convention/synthetic-smart-building/api-response-format]]
