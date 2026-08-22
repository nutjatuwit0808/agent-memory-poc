---
layer: structure
tags: [architecture, boundaries]
created: 2026-01-23
links:
  - "[[structure/overview-architecture]]"
  - "[[structure/database-schema]]"
---

# Service Boundaries

ตารางนี้บอกว่า data แต่ละก้อนใครเป็นเจ้าของตัวจริง (source of truth)

| Data | เจ้าของ | Service อื่นเข้าถึงยังไง |
|---|---|---|
| Order status | order-service | subscribe event `order.*` |
| Payment record | payment-service | เรียก API `GET /payments/:id` |
| Refund record | refund-service | เรียก API หรือ subscribe `refund.*` |
| Stock level | inventory-service | เรียก API `checkStock` เท่านั้น ห้าม cache นาน |
| Customer profile | auth-service | เรียก API `GET /users/:id` |

## หลักการ

ถ้า service A ต้องอ่านข้อมูลของ service B บ่อยจนกระทบ latency ให้แก้ด้วยการ subscribe event มา cache ไว้ฝั่งตัวเอง ไม่ใช่เปิด direct database access ข้าม service — หลักการนี้เขียนละเอียดใน [[structure/database-schema]]

## ข้อยกเว้นเดียวที่มี

reporting-service (ไม่ได้อยู่ใน scope เอกสารนี้) มีสิทธิ์ read-replica ข้าม database ได้เพราะเป็น analytics ล้วนๆ ไม่กระทบ transactional flow
