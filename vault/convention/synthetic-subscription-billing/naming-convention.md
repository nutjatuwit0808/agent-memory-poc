---
layer: convention
tags: [naming, style]
created: 2026-04-04
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `calculateProration`, `retryPayment` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier

`subscriptionId` รูปแบบ `sub_<ULID>`, `invoiceId` รูปแบบ `inv_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer
