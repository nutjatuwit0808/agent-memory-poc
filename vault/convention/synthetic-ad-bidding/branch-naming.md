---
layer: convention
tags: [git, workflow]
created: 2025-12-06
links:
  - "[[convention/synthetic-ad-bidding/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/AD-142-pacing-clock-sync`, `fix/AD-158-fraud-allowlist-threshold`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-ad-bidding/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
