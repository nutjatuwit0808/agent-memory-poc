---
layer: deployment
tags: [rollback, deployment]
created: 2026-06-23
links:
  - "[[support-cases/synthetic-supply-chain/case-8395]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ PO creation error rate เกิน 5% หรือมี replenishment loop เกิดขึ้น ต้อง rollback ทันทีโดยไม่รอ approval บทเรียนจาก [[support-cases/synthetic-supply-chain/case-8395]] คือทุกนาทีที่รอมี cost เพิ่มขึ้นเรื่อยๆ

## ขั้นตอน

deploy version ก่อนหน้ากลับผ่าน pipeline เดิม (ไม่ skip smoke test) ถ้า replenishment loop ค้างอยู่ต้องหยุด service ก่อน deploy ไม่ใช่ deploy ทับทันที เพราะ PO ที่สร้างเกินอาจส่งถึงซัพพลายเออร์แล้ว
