---
layer: convention
tags: [naming, style]
created: 2026-07-17
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `evaluateDemand`, `triggerLoadShedding` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier

`meterId` รูปแบบ `mtr_<ULID>`, `facilityId` รูปแบบ `fac_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer
