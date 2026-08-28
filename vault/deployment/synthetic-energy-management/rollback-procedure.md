---
layer: deployment
tags: [rollback, deployment]
created: 2026-07-07
links:
  - "[[support-cases/synthetic-energy-management/case-3658]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้คำสั่งควบคุมอุปกรณ์ผิดพลาดหรือ demand response ตัดสินใจผิด ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-energy-management/case-3658]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมอาคารทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม
