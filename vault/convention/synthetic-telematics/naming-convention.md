---
layer: convention
tags: [naming, style]
created: 2026-06-16
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `calculateTripScore`, `evaluateHarshEvent` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier

`tripId` รูปแบบ `trp_<ULID>`, `deviceId` รูปแบบ `dev_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer
