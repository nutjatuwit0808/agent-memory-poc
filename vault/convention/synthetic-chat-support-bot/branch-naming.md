---
layer: convention
tags: [git, workflow]
created: 2026-01-29
links:
  - "[[convention/synthetic-chat-support-bot/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/HL-231-handoff-priority-queue`, `fix/HL-247-rate-limiter-cache-key`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-chat-support-bot/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
