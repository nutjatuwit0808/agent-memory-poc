---
layer: convention
tags: [error, api]
created: 2026-03-17
---

# Error Code Convention

## รูปแบบ

`WH_<DOMAIN>_<REASON>` เช่น `WH_VEHICLE_NOT_FOUND`, `WH_PARTS_INSUFFICIENT_STOCK`, `WH_INSPECTION_VERSION_MISMATCH` — uppercase ทั้งหมด

## Domain prefix ที่ใช้

`WH_VEHICLE`, `WH_WORKORDER`, `WH_PARTS`, `WH_INSPECTION`, `WH_DOWNTIME`, `WH_REORDER` — ตรงกับชื่อ module หลัก
