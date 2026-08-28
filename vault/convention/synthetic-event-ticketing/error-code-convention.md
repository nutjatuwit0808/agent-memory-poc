---
layer: convention
tags: [error, api]
created: 2026-06-26
links:
  - "[[convention/synthetic-event-ticketing/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`TIX_<DOMAIN>_<REASON>` เช่น `TIX_SEAT_ALREADY_HELD`, `TIX_TRANSFER_INELIGIBLE` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`TIX_RESALE_PRICE_EXCEEDS_CAP`, `TIX_ENTRY_DUPLICATE_SCAN`, `TIX_WAITLIST_OFFER_EXPIRED` — ดูรายชื่อเต็มที่ [[convention/synthetic-event-ticketing/api-response-format]]
