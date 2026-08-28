---
layer: convention
tags: [naming, style]
created: 2025-11-01
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `refreshSegment`, `computeHealthScore` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier

`segmentId` เป็น UUID v4, `customerToken` เป็น SHA-256 hex ของ customer_id เสมอ — ห้ามส่ง raw customer_id ออกนอก event-ingester
