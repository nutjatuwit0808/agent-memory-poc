---
layer: convention
tags: [naming, style]
created: 2025-11-11
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `setZoneSetpoint`, `evaluateBadgeSwipe` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier ทางกายภาพ

`zoneId` รูปแบบ `<อาคาร>-<ชั้น>-<โซนย่อย>` เช่น `HQ-12-A`, `doorId` รูปแบบ `<zoneId>-DOOR-<เลข>` ต้องตรงกับ physical label บนอุปกรณ์จริงเสมอ
