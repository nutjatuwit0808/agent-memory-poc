---
layer: convention
tags: [git, workflow]
created: 2025-11-17
links:
  - "[[convention/synthetic-health-records/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/VITAL-512-break-glass-alert`, `fix/VITAL-529-refill-timezone-bug`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-health-records/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
