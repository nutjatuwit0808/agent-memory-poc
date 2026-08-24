---
layer: deployment
tags: [rollback, deployment]
created: 2026-02-06
links:
  - "[[support-cases/synthetic-document-signing/case-1601]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ `validateSignerTurn` หรือ `verifyChainIntegrity` ทำงานผิดพลาดแม้เพียงกรณีเดียว ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-document-signing/case-1601]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมกฎหมายของลูกค้าที่ได้รับผลกระทบทุกครั้งแม้ rollback สำเร็จแล้วก็ตาม เพราะความน่าเชื่อถือของระบบกระทบต่อลูกค้าโดยตรง
