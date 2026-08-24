---
layer: convention
tags: [git, workflow]
created: 2026-07-28
links:
  - "[[convention/synthetic-social-feed/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/PULSE-341-trending-decay-tuning`, `fix/PULSE-358-fanout-dedup-race`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-social-feed/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
