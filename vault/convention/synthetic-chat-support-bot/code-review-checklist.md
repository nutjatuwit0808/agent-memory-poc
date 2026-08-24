---
layer: convention
tags: [review, quality]
created: 2025-11-26
links:
  - "[[support-cases/synthetic-chat-support-bot/case-8126]]"
  - "[[support-cases/synthetic-chat-support-bot/case-9777]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้ state ของบทสนทนาหรือ cache key ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-chat-support-bot/case-8126]]) และฟีเจอร์ที่อ่านข้อความลูกค้าดิบต้องผ่าน PII path review ก่อน merge (ดูบทเรียนจาก [[support-cases/synthetic-chat-support-bot/case-9777]])
