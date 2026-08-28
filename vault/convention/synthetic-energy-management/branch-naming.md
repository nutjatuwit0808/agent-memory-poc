---
layer: convention
tags: [git, workflow]
created: 2025-12-27
links:
  - "[[convention/synthetic-energy-management/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/GRID-274-baseline-drift-detection`, `fix/GRID-289-cooldown-facility-mapping`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-energy-management/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
