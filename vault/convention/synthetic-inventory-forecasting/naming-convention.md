---
layer: convention
tags: [naming, style]
created: 2025-10-13
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `computeReplenishmentQty`, `applySeasonalIndex` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier ทางธุรกิจ

`skuId` รูปแบบ `SKU-<6 หลัก>`, `storeId` รูปแบบ `ST-<4 หลัก>`, `batchId` รูปแบบ `<regionId>-<YYYYMMDD>` ต้องตรงกันทุก service
