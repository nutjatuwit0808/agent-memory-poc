---
layer: convention
tags: [schema, versioning, compatibility]
created: 2026-05-20
links:
  - "[[structure/synthetic-customer-segmentation/module-event-ingester]]"
  - "[[support-cases/synthetic-customer-segmentation/case-8589]]"
---

# Event Schema Versioning

ทุก event type ต้องมี schema version ที่ชัดเจน เพื่อให้ [[structure/synthetic-customer-segmentation/module-event-ingester]] validate ได้ถูกต้องและรองรับ backward compatibility เมื่อ source system update schema

## รูปแบบ version

`v<major>.<minor>` เช่น `v1.0`, `v1.2` — minor เพิ่มเมื่อ add optional field, major เพิ่มเมื่อ remove หรือ rename field ที่มีอยู่แล้ว

## Backward compatibility

ingester ต้องรองรับ schema เก่าอย่างน้อย 2 major version ก่อนหน้าควบคู่ไปกับ current — source system มีเวลา migrate ไม่น้อยกว่า 1 quarter ก่อน schema เก่าถูก deprecate บทเรียนจาก [[support-cases/synthetic-customer-segmentation/case-8589]]
