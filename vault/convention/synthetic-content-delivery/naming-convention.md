---
layer: convention
tags: [naming, style]
created: 2025-09-14
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `lookupEntry`, `dispatchInvalidation` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier ของระบบ

`tenantId` รูปแบบ `t-<UUID>`, `contentKey` รูปแบบ `<path>?<query>` normalized เสมอ ห้ามมี trailing slash หรือ query parameter ที่ไม่ได้เป็นส่วนของ content จริง เพราะจะทำให้ cache key ไม่ match
