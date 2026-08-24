---
layer: deployment
tags: [rollback, deployment]
created: 2025-11-08
links:
  - "[[support-cases/synthetic-recruitment-ats/case-5486]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ offer ถูกส่งออกไปโดยขาด approval หรือ resume parser confidence score ตกลงผิดปกติทั่วทั้งระบบ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-recruitment-ats/case-5486]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip integration test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม
