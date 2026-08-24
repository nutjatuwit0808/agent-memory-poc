---
layer: convention
tags: [error, api]
created: 2025-11-10
links:
  - "[[convention/synthetic-travel-booking/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`TRIP_<DOMAIN>_<REASON>` เช่น `TRIP_BOOKING_HOLD_EXPIRED`, `TRIP_INVENTORY_UNAVAILABLE` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`TRIP_SUPPLIER_DEGRADED`, `TRIP_CURRENCY_UNSUPPORTED`, `TRIP_REFUND_STUCK` — ดูรายชื่อเต็มที่ [[convention/synthetic-travel-booking/api-response-format]]
