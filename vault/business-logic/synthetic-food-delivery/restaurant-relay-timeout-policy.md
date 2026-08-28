---
layer: business-logic
tags: [restaurant, timeout, policy]
created: 2026-02-19
links:
  - "[[structure/synthetic-food-delivery/module-restaurant-relay]]"
  - "[[business-logic/synthetic-food-delivery/restaurant-cancellation-penalty-policy]]"
---

# นโยบาย Timeout ของ Restaurant Relay

[[structure/synthetic-food-delivery/module-restaurant-relay]] รอการยืนยันจากร้านได้ไม่เกิน 3 นาที ถ้าร้านไม่ตอบภายในเวลาดังกล่าว ออร์เดอร์จะถูกยกเลิกอัตโนมัติและแจ้งลูกค้า ไม่ได้ route ไปร้านอื่นโดยอัตโนมัติ เพราะเมนูที่ลูกค้าเลือกอาจมีเฉพาะที่ร้านนั้น

ร้านที่ timeout เกิน 2 ครั้งใน 1 วัน จะถูก auto-flag ให้ [[structure/synthetic-food-delivery/module-restaurant-relay]] ตรวจสอบ connectivity และอาจ mark ว่า `unreachable` ชั่วคราว ดู [[business-logic/synthetic-food-delivery/restaurant-cancellation-penalty-policy]] สำหรับผลที่ตามมา
