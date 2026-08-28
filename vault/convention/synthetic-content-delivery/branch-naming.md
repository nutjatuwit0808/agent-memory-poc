---
layer: convention
tags: [git, workflow]
created: 2025-10-05
links:
  - "[[convention/synthetic-content-delivery/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/EDGE-301-cert-renewal-alert`, `fix/EDGE-287-invalidation-race-condition`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-content-delivery/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
