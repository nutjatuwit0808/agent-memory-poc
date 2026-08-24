---
layer: deployment
tags: [rollback, deployment]
created: 2025-11-01
links:
  - "[[support-cases/synthetic-ad-bidding/case-6498]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ win rate ตกต่ำผิดปกติเกิน 15% หรือ latency p99 เกิน time budget ต้อง rollback ทันทีโดยไม่ต้องรอ approval — สำหรับ fraud rule ให้พิจารณา rollback เฉพาะ condition ที่มีปัญหาแทนการ rollback ทั้ง rule เมื่อเป็นไปได้ (บทเรียนจาก [[support-cases/synthetic-ad-bidding/case-6498]])

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ ไม่ skip smoke test แม้เป็นสถานการณ์เร่งด่วน แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้ rollback สำเร็จแล้วก็ตาม
