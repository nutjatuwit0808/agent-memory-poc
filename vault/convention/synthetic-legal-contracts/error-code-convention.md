---
layer: convention
tags: [error, api]
created: 2026-08-09
links:
  - "[[convention/synthetic-legal-contracts/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`LEX_<DOMAIN>_<REASON>` เช่น `LEX_APPROVAL_STEP_PENDING`, `LEX_SIGNATURE_ORDER_VIOLATION` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`LEX_TEMPLATE_VERSION_STALE`, `LEX_COUNTERPARTY_UNVERIFIED`, `LEX_NEGOTIATION_ROUND_EXCEEDED` — ดูรายชื่อเต็มที่ [[convention/synthetic-legal-contracts/api-response-format]]
