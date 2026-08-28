---
layer: deployment
tags: [rollback, deployment]
created: 2026-07-15
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ assessment security test fail, progress regression เพิ่มขึ้น, หรือ certificate issuance error rate เกิน 1% ต้อง rollback ทันทีโดยไม่รอ approval — error เหล่านี้กระทบ data integrity ที่แก้ยากมากกว่า rollback

## ขั้นตอน

deploy version ก่อนหน้ากลับผ่าน pipeline เดิม (ไม่ skip security test) ถ้า certificate ออกไปแล้วระหว่าง bad deploy ต้องตรวจสอบและ revoke ถ้าออกผิด ไม่ปล่อยไว้แม้จะ rollback code แล้ว
