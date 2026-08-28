---
layer: business-logic
tags: [technician, certification, policy]
created: 2026-06-28
links:
  - "[[structure/synthetic-fleet-maintenance/module-work-order-manager]]"
---

# นโยบายใบรับรองช่างซ่อม

ช่างต้องมีใบรับรองที่ valid สำหรับ vehicle type ที่จะซ่อมก่อนรับ work order ได้ [[structure/synthetic-fleet-maintenance/module-work-order-manager]] ตรวจ certification ของช่างก่อน assign เสมอ ถ้าไม่มี certification ที่ตรงจะ reject และแจ้งให้หา assign ช่างคนอื่น

ใบรับรองที่หมดอายุภายใน 30 วันจะ flag ให้ Fleet Manager จัดการต่ออายุก่อนที่จะหมด เพื่อไม่ให้กระทบความสามารถรับงานของช่างคนนั้น
