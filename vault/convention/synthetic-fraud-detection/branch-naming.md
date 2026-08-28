---
layer: convention
tags: [git, workflow]
created: 2026-03-03
links:
  - "[[convention/synthetic-fraud-detection/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/SAI-88-velocity-sliding-window`, `fix/SAI-201-case-auto-close-status`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-fraud-detection/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
