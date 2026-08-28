---
layer: convention
tags: [git, workflow]
created: 2026-01-25
links:
  - "[[convention/synthetic-subscription-billing/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/RECUR-318-idempotent-plan-change`, `fix/RECUR-329-dunning-lock`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-subscription-billing/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
