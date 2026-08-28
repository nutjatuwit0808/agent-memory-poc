---
layer: convention
tags: [naming, style]
created: 2026-05-10
links:
  - "[[convention/synthetic-asset-management/asset-id-format]]"
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `allocateLicense`, `completeDisposal` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier สินทรัพย์

`assetId` รูปแบบ `AT-<4 หลัก>` ตรงกับ [[convention/synthetic-asset-management/asset-id-format]] เสมอ, `productId` สำหรับ license ใช้รูปแบบที่ vendor กำหนด
