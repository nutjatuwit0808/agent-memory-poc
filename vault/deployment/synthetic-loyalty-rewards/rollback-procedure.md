---
layer: deployment
tags: [rollback, deployment]
created: 2025-10-28
links:
  - "[[support-cases/synthetic-loyalty-rewards/case-3333]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า credit/debit error rate พุ่งขึ้น หรือ point liability เพิ่มผิดปกติ ต้อง rollback ทันทีโดยไม่รอ approval บทเรียนจาก [[support-cases/synthetic-loyalty-rewards/case-3333]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้าผ่าน pipeline เดิม ตรวจ point_transactions หลัง rollback ว่ายังสอดคล้องกับ balance แล้วแจ้งทีมที่เกี่ยวข้อง
