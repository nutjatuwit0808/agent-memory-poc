---
layer: deployment
tags: [rollback, deployment]
created: 2026-04-05
links:
  - "[[support-cases/synthetic-legal-contracts/case-3092]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ approval chain คำนวณผิดหรือลำดับการเซ็นผิดเพี้ยน ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-legal-contracts/case-3092]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมกฎหมายทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม
