---
layer: convention
tags: [git, workflow]
created: 2026-06-12
links:
  - "[[convention/synthetic-event-ticketing/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/TIX-412-atomic-seat-hold`, `fix/TIX-428-waitlist-order-by`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-event-ticketing/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
