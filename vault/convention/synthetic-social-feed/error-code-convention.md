---
layer: convention
tags: [error, api]
created: 2026-06-17
links:
  - "[[convention/synthetic-social-feed/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`PULSE_<DOMAIN>_<REASON>` เช่น `PULSE_FOLLOW_ALREADY_PENDING`, `PULSE_MODERATION_QUEUE_FULL` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`PULSE_RANKING_TIMEOUT`, `PULSE_FANOUT_RATE_LIMITED`, `PULSE_ENGAGEMENT_DUPLICATE` — ดูรายชื่อเต็มที่ [[convention/synthetic-social-feed/api-response-format]]
