---
layer: deployment
tags: [rollback, deployment]
created: 2025-11-01
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ disposal certification check หยุดทำงาน หรือ license allocation ทำงานผิด ต้อง rollback ทันทีโดยไม่ต้องรอ approval — compliance risk สูงกว่า downtime risk

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกัน (ไม่ skip smoke test) แล้วตรวจสอบว่า compliance-sensitive function กลับมาทำงานถูกต้องก่อนแจ้งว่า rollback สำเร็จ
