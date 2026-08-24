---
layer: convention
tags: [git, workflow]
created: 2025-09-04
links:
  - "[[convention/synthetic-marketing-automation/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/WAVE-231-segment-freshness-check`, `fix/WAVE-244-duplicate-send-constraint`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-marketing-automation/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
