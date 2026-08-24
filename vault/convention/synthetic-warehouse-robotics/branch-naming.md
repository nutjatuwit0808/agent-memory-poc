---
layer: convention
tags: [git, workflow]
created: 2025-11-26
links:
  - "[[convention/synthetic-warehouse-robotics/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/WARE-204-pick-retry-backoff`, `fix/WARE-211-charging-deadlock`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-warehouse-robotics/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
