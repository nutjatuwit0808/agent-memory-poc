---
layer: deployment
tags: [rollback, deployment]
created: 2025-12-20
links:
  - "[[support-cases/synthetic-smart-building/case-5676]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ occupancy sensor offline rate พุ่งขึ้นผิดปกติ หรือ access-control-gateway ปฏิเสธบัตรถูกต้องเพิ่มขึ้นผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-smart-building/case-5676]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม
