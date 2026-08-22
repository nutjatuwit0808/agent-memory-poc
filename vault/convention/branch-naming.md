---
layer: convention
tags: [git, workflow]
created: 2026-01-16
links:
  - "[[convention/commit-message-style]]"
---

# Branch Naming

## รูปแบบ

```
<type>/<เลข-ticket>-<คำอธิบายสั้น>
```

ตัวอย่าง: `feat/PAY-102-refund-timeout-retry`, `fix/PAY-118-order-cancel-race-condition`

## Type ที่ใช้

ใช้ prefix เดียวกับ [[convention/commit-message-style]]: `feat`, `fix`, `refactor`, `docs`, `chore`

## กติกา

- ชื่อ branch ต้องมีเลข ticket เสมอ ไม่มี ticket ห้าม branch ออกจาก `main`
- คำอธิบายสั้นใช้ `kebab-case` ไม่เกิน 5 คำ
- branch ที่ merge แล้วให้ลบทิ้งทันที ไม่เก็บไว้เป็น archive บน remote
