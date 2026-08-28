---
layer: deployment
tags: [rollback, deployment]
created: 2025-09-06
links:
  - "[[support-cases/synthetic-subscription-billing/case-8712]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้เรียกเก็บเงินผิดพลาดหรือ downgrade มีผลผิดเวลา ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-subscription-billing/case-8712]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมการเงินทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม
