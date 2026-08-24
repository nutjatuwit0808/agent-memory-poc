---
layer: deployment
tags: [rollback, deployment]
created: 2026-03-30
links:
  - "[[support-cases/synthetic-iot-fleet-tracker/case-9780]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ ping ingestion rate ตกลงผิดปกติ หรือ geofence event ผิดพลาดเพิ่มขึ้นผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-iot-fleet-tracker/case-9780]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip ขั้นตอน smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม
