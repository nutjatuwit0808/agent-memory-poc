---
layer: convention
tags: [git, workflow]
created: 2025-10-19
links:
  - "[[convention/synthetic-fleet-maintenance/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/WH-312-vehicle-swap-odometer`, `fix/WH-401-reorder-dedup`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที prefix ต้องตรงกับ [[convention/synthetic-fleet-maintenance/commit-message-style]]
