---
layer: convention
tags: [error, api]
created: 2025-10-05
links:
  - "[[convention/synthetic-subscription-billing/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`RECUR_<DOMAIN>_<REASON>` เช่น `RECUR_PLAN_CHANGE_COOLDOWN`, `RECUR_DUNNING_MAX_RETRY_REACHED` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`RECUR_PRORATION_BELOW_MINIMUM`, `RECUR_TRIAL_EXTENSION_CAPPED`, `RECUR_USAGE_QUOTA_EXCEEDED` — ดูรายชื่อเต็มที่ [[convention/synthetic-subscription-billing/api-response-format]]
