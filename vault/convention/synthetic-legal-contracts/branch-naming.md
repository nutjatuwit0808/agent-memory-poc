---
layer: convention
tags: [git, workflow]
created: 2026-01-22
links:
  - "[[convention/synthetic-legal-contracts/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/LEX-341-approval-role-validation`, `fix/LEX-358-signature-order-lock`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-legal-contracts/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
