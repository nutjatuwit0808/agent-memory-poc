---
layer: convention
tags: [testing, quality]
created: 2026-07-21
links:
  - "[[support-cases/synthetic-social-feed/case-4431]]"
  - "[[support-cases/synthetic-social-feed/case-6360]]"
---

# Testing Convention

## Dedup test

ฟังก์ชันที่เกี่ยวกับ dedup (engagement, notification) ต้องมี test จำลอง concurrent request อย่างน้อย 2 ตัวเสมอ — บทเรียนจาก [[support-cases/synthetic-social-feed/case-4431]]

## Canary สำหรับโมเดล

โมเดล ranking หรือ moderation เวอร์ชันใหม่ต้องผ่าน canary test กับ traffic 1% อย่างน้อย 24 ชั่วโมงก่อนขยายเต็ม — บทเรียนจาก [[support-cases/synthetic-social-feed/case-6360]]
