---
layer: convention
tags: [naming, style]
created: 2026-03-08
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `holdInventory`, `computeRefundAmount` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier ทางธุรกิจ

`bookingId` รูปแบบ `BK-<8 หลัก>`, `offerId` รูปแบบ `<supplierId>-<internal ref>` ต้องตรงกับที่ frontend และ log ใช้เสมอ
