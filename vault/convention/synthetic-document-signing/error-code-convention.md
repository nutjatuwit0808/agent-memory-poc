---
layer: convention
tags: [error, api]
created: 2026-05-29
links:
  - "[[convention/synthetic-document-signing/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`SIGN_<DOMAIN>_<REASON>` เช่น `SIGN_ENVELOPE_EXPIRED`, `SIGN_SIGNER_OUT_OF_ORDER` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`SIGN_NOTARY_SESSION_FAILED`, `SIGN_TEMPLATE_FIELD_MISSING`, `SIGN_AUDIT_CHAIN_BROKEN` — ดูรายชื่อเต็มที่ [[convention/synthetic-document-signing/api-response-format]]
