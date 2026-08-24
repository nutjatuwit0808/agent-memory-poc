---
layer: convention
tags: [error, api]
created: 2026-02-18
links:
  - "[[convention/synthetic-warehouse-robotics/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`WARE_<DOMAIN>_<REASON>` เช่น `WARE_PICK_NOT_FOUND`, `WARE_CHARGE_STATION_BUSY` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`WARE_FLEET_OFFLINE`, `WARE_TASK_STUCK`, `WARE_SAFETY_ZONE_BLOCKED` — ดูรายชื่อเต็มที่ [[convention/synthetic-warehouse-robotics/api-response-format]]
