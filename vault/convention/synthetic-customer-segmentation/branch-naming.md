---
layer: convention
tags: [git, workflow]
created: 2026-08-15
links:
  - "[[convention/synthetic-customer-segmentation/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/SEG-88-pii-scanner-fuzzy-match`, `fix/SEG-97-membership-lock-global`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-customer-segmentation/commit-message-style]] สำหรับ type prefix
