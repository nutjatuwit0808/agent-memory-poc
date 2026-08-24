---
layer: convention
tags: [error, api]
created: 2026-05-21
links:
  - "[[convention/synthetic-chat-support-bot/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`HL_<DOMAIN>_<REASON>` เช่น `HL_INTENT_LOW_CONFIDENCE`, `HL_HANDOFF_QUEUE_FULL` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`HL_RATE_LIMIT_EXCEEDED`, `HL_KB_ARTICLE_NOT_FOUND`, `HL_SESSION_EXPIRED` — ดูรายชื่อเต็มที่ [[convention/synthetic-chat-support-bot/api-response-format]]
