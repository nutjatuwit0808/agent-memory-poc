---
layer: deployment
tags: [rollback, deployment]
created: 2026-05-22
links:
  - "[[support-cases/synthetic-health-records/case-1310]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ access-control ปฏิเสธ/อนุมัติผิดพลาด หรือ audit log หยุดบันทึก ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-health-records/case-1310]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมที่เกี่ยวข้องและทีม compliance ทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม
