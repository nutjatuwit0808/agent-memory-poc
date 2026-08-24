---
layer: deployment
tags: [rollback, deployment]
created: 2025-10-07
links:
  - "[[support-cases/synthetic-inventory-forecasting/case-1042]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้าโมเดลใหม่ทำให้ WAPE เฉลี่ยของ category ใดๆ แย่ลงเกิน 10 percentage point เทียบกับเวอร์ชันก่อนหน้าภายในสัปดาห์แรกหลัง deploy ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-inventory-forecasting/case-1042]]

## ขั้นตอน

rollback เวอร์ชันโมเดลก่อนหน้าผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีม category ที่ได้รับผลกระทบทุกครั้งแม้ rollback สำเร็จแล้วก็ตาม
