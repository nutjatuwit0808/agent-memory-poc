---
layer: convention
tags: [git, workflow]
created: 2026-03-23
links:
  - "[[convention/synthetic-video-streaming/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/SF-142-hevc-ladder-fallback`, `fix/SF-158-origin-shield-cache-key`

## กติกา

ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู [[convention/synthetic-video-streaming/commit-message-style]] สำหรับ prefix ที่ใช้ร่วมกัน
