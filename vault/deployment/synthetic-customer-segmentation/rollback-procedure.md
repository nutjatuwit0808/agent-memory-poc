---
layer: deployment
tags: [rollback, deployment]
created: 2026-05-18
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ PII scanner หยุดทำงาน, export ส่งข้อมูลผิด channel, หรือ membership snapshot corrupt ต้อง rollback ทันทีโดยไม่รอ approval

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดิม (ไม่ skip smoke test) แล้วตรวจสอบว่า PII scanner และ export path กลับมาทำงานถูกต้องก่อนประกาศ rollback สำเร็จ
