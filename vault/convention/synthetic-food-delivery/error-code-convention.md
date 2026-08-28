---
layer: convention
tags: [error, api]
created: 2026-07-11
links:
  - "[[convention/synthetic-food-delivery/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`QB_<DOMAIN>_<REASON>` เช่น `QB_ROUTE_NO_DRIVER`, `QB_SURGE_CAP_EXCEEDED`, `QB_PAYOUT_DUPLICATE` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`QB_DRIVER_OFFLINE`, `QB_ORDER_TIMEOUT`, `QB_RESTAURANT_UNAVAILABLE`, `QB_ETA_FALLBACK` — ดูรายชื่อเต็มที่ [[convention/synthetic-food-delivery/api-response-format]]
