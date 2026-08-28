---
layer: convention
tags: [naming, style]
created: 2026-04-28
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `computeApprovalChain`, `recordSignature` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier

`contractId` รูปแบบ `ctr_<ULID>`, `templateId` รูปแบบ `tpl_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer เพื่อไม่ให้เดาจำนวนสัญญาทั้งหมดในระบบได้
