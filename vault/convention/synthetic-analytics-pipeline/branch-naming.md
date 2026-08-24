---
layer: convention
tags: [git, workflow]
created: 2026-05-10
links:
  - "[[convention/synthetic-analytics-pipeline/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/DATA-142-late-arrival-window`, `fix/DATA-207-dag-circular-dependency`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-analytics-pipeline/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
