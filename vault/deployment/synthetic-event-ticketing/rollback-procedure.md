---
layer: deployment
tags: [rollback, deployment]
created: 2025-12-19
links:
  - "[[support-cases/synthetic-event-ticketing/case-1330]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้เกิดการจองซ้อนที่นั่งหรือสแกนบัตรผิดพลาด ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-event-ticketing/case-1330]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมงานทันทีโดยเฉพาะถ้าเกิดใกล้ช่วงเปิดขายบัตรหรือวันงานจริง
