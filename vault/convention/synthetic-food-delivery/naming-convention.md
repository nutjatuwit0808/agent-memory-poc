---
layer: convention
tags: [naming, style]
created: 2026-02-21
links:
  - "[[support-cases/synthetic-food-delivery/case-8986]]"
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `routeOrder`, `getSurgeMultiplier` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย ทุก timestamp ใน record ต้อง store เป็น UTC เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-food-delivery/case-8986]])

## Identifier ของ entity หลัก

`orderId` รูปแบบ UUID v4, `driverId` รูปแบบ `DRV-<6 หลัก>`, `restaurantId` รูปแบบ `RST-<4 หลัก>` ต้องตรงกับ record จริงใน database เสมอ
