---
layer: convention
tags: [git, workflow]
created: 2025-10-17
links:
  - "[[convention/synthetic-document-signing/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/SIGN-211-delegate-scoped-session`, `fix/SIGN-227-reminder-timezone`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-document-signing/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
