---
layer: convention
tags: [error, api]
created: 2026-02-19
links:
  - "[[convention/synthetic-e-learning/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`LEARN_<DOMAIN>_<REASON>` เช่น `LEARN_ENROLLMENT_DUPLICATE`, `LEARN_ASSESSMENT_TIMER_EXPIRED`, `LEARN_CERTIFICATE_NOT_ELIGIBLE` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`LEARN_PROGRESS_REGRESSION`, `LEARN_ASSESSMENT_ANSWER_SUBMITTED_LATE`, `LEARN_COMPLIANCE_DEADLINE_EXCEEDED` — ดูรายชื่อเต็มที่ [[convention/synthetic-e-learning/api-response-format]]
