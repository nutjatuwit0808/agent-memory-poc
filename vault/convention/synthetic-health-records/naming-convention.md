---
layer: convention
tags: [naming, style]
created: 2025-10-22
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `checkAccess`, `flagCriticalValue` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier

`patientId` รูปแบบ `pt_<ULID>`, `providerId` รูปแบบ `prv_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer เพื่อไม่ให้เดาจำนวนผู้ป่วยทั้งระบบได้
