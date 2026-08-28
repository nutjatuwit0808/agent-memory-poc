---
layer: convention
tags: [git, workflow]
created: 2026-02-28
links:
  - "[[convention/synthetic-e-learning/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/LEARN-088-server-side-timer-enforcement`, `fix/LEARN-112-certificate-cache-key-isolation`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-e-learning/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
