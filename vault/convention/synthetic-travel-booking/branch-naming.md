---
layer: convention
tags: [git, workflow]
created: 2026-06-03
links:
  - "[[convention/synthetic-travel-booking/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/TRIP-118-hold-atomic-update`, `fix/TRIP-204-refund-proration-rounding`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-travel-booking/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
