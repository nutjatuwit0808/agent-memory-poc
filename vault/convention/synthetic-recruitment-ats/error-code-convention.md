---
layer: convention
tags: [error, api]
created: 2025-12-28
links:
  - "[[convention/synthetic-recruitment-ats/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`ATS_<DOMAIN>_<REASON>` เช่น `ATS_PARSER_LOW_CONFIDENCE`, `ATS_OFFER_APPROVAL_INCOMPLETE` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`ATS_PIPELINE_DUPLICATE_CANDIDATE`, `ATS_SCHEDULE_CONFLICT`, `ATS_BGCHECK_STUCK` — ดูรายชื่อเต็มที่ [[convention/synthetic-recruitment-ats/api-response-format]]
