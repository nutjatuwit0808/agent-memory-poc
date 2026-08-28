---
layer: convention
tags: [git, workflow]
created: 2026-04-25
links:
  - "[[convention/synthetic-asset-management/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/ASSET-102-disposal-certification-check`, `fix/ASSET-119-license-sync-retry`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-asset-management/commit-message-style]] สำหรับ type prefix
