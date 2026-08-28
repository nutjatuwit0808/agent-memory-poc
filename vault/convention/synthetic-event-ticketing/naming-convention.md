---
layer: convention
tags: [naming, style]
created: 2025-12-29
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `holdSeat`, `checkDuplicateEntry` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier

`seatId` รูปแบบ `seat_<ULID>`, `ticketId` รูปแบบ `tix_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer เพื่อไม่ให้เดาจำนวนบัตรทั้งระบบได้
