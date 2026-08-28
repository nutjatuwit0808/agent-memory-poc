---
layer: deployment
tags: [rollback, deployment]
created: 2025-12-26
links:
  - "[[support-cases/synthetic-food-delivery/case-2043]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ order success rate ตกต่ำกว่า 85% หรือมี payout error เพิ่มขึ้นผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-food-delivery/case-2043]]

## ขั้นตอน

deploy version ก่อนหน้ากลับผ่าน pipeline เดียวกัน ไม่ skip smoke test แล้วแจ้งทีม Finance ทุกครั้งที่ rollback เกี่ยวกับ payout-engine หรือ surge-pricer
