---
layer: convention
tags: [git, workflow]
created: 2026-06-27
links:
  - "[[convention/synthetic-food-delivery/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/QB-142-surge-cap-validation`, `fix/QB-307-driver-cache-invalidation`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-food-delivery/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
