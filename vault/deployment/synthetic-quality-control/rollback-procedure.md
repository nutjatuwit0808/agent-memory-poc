---
layer: deployment
tags: [rollback, deployment]
created: 2025-10-25
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ false alarm rate ของ SPC เพิ่มขึ้นเกิน 2 เท่าภายใน 1 ชั่วโมง หรือถ้ามี certification error เกิดขึ้นหลัง deploy ต้อง rollback ทันทีโดยไม่รอ approval

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกัน ตรวจ active quarantine hold และ pending certification ก่อนและหลัง rollback ว่าไม่มี data corruption
