---
layer: convention
tags: [git, workflow]
created: 2026-04-08
links:
  - "[[convention/synthetic-smart-building/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/ATR-118-hvac-override-expiry`, `fix/ATR-142-fire-drill-egress-lock`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-smart-building/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
