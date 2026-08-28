---
layer: deployment
tags: [rollback, deployment]
created: 2025-09-10
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ cache hit rate ตกต่ำกว่า 80%, มี tenant isolation failure ใดๆ, หรือ geo-restriction enforcement ผิดพลาด ต้อง rollback ทันทีโดยไม่ต้องรอ approval

## ขั้นตอน

Deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ หลัง rollback ต้อง verify ว่า cache key ยังถูกต้อง และ geo-restriction enforcement ทำงานปกติ ก่อนถือว่า rollback สำเร็จ
