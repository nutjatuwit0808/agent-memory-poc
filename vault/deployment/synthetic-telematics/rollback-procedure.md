---
layer: deployment
tags: [rollback, deployment]
created: 2026-07-26
links:
  - "[[support-cases/synthetic-telematics/case-1209]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้การตรวจจับอุบัติเหตุผิดพลาดหรือการคำนวณเบี้ยคลาดเคลื่อน ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-telematics/case-1209]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมความปลอดภัยและทีมประเมินความเสี่ยงทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม
