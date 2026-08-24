---
layer: deployment
tags: [rollback, deployment]
created: 2026-08-09
links:
  - "[[support-cases/synthetic-social-feed/case-6360]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ false-positive rate ของ moderation พุ่งเกินเกณฑ์ปกติ หรือ feed error rate สูงผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-social-feed/case-6360]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม
