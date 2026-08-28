---
layer: deployment
tags: [rollback, deployment]
created: 2025-09-08
links:
  - "[[support-cases/synthetic-fleet-maintenance/case-1494]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ parts deduction error rate เพิ่มขึ้น หรือ downtime event ไม่ถูกบันทึก ต้อง rollback ทันทีโดยไม่รอ approval — บทเรียนจาก [[support-cases/synthetic-fleet-maintenance/case-1494]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกัน ตรวจ active work order และ pending reorder ก่อนและหลัง rollback ว่าข้อมูลครบถ้วน
