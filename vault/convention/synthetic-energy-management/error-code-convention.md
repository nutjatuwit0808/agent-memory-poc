---
layer: convention
tags: [error, api]
created: 2025-11-26
links:
  - "[[convention/synthetic-energy-management/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`GRID_<DOMAIN>_<REASON>` เช่น `GRID_METER_OFFLINE`, `GRID_DEMAND_COOLDOWN_ACTIVE` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`GRID_EQUIPMENT_LOCKOUT_ACTIVE`, `GRID_ANOMALY_BASELINE_INCOMPLETE`, `GRID_TARIFF_NOT_CONFIGURED` — ดูรายชื่อเต็มที่ [[convention/synthetic-energy-management/api-response-format]]
