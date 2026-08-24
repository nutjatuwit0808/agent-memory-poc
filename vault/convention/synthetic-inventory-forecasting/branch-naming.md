---
layer: convention
tags: [git, workflow]
created: 2026-01-07
links:
  - "[[convention/synthetic-inventory-forecasting/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/FCST-142-cold-start-blend-window`, `fix/FCST-158-feature-freshness-timestamp`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-inventory-forecasting/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
