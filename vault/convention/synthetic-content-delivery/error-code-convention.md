---
layer: convention
tags: [error, api]
created: 2026-06-29
links:
  - "[[convention/synthetic-content-delivery/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`EDGE_<DOMAIN>_<REASON>` เช่น `EDGE_CACHE_MISS`, `EDGE_GEO_BLOCKED`, `EDGE_CERT_EXPIRED` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`EDGE_ORIGIN_TIMEOUT`, `EDGE_INVALIDATION_TIMEOUT`, `EDGE_BANDWIDTH_EXCEEDED` — ดูรายชื่อเต็มที่ [[convention/synthetic-content-delivery/api-response-format]]
