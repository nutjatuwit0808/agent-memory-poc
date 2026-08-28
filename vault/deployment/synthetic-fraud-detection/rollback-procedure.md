---
layer: deployment
tags: [rollback, deployment]
created: 2026-08-16
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ false positive rate > 5% หรือ false negative เพิ่มผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval เพราะส่งผล fraud exposure โดยตรง

## ขั้นตอน

deploy version ก่อนหน้ากลับผ่าน pipeline เดียวกัน ไม่ skip shadow test สำหรับ ml-scorer และแจ้ง Risk & Compliance ทุกครั้งที่ rollback service ที่เกี่ยวกับ fraud decision
