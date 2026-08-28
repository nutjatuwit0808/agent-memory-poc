---
layer: convention
tags: [git, workflow]
created: 2026-05-03
links:
  - "[[convention/synthetic-loyalty-rewards/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/PV-301-expiry-partial`, `fix/PV-318-redemption-race`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-loyalty-rewards/commit-message-style]] สำหรับ type prefix ที่ใช้ร่วมกัน
