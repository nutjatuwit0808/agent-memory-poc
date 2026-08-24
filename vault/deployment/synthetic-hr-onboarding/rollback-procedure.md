---
layer: deployment
tags: [rollback, deployment]
created: 2025-12-18
links:
  - "[[support-cases/synthetic-hr-onboarding/case-8669]]"
---

# Rollback Procedure

## เมื่อไหร่ต้อง rollback ทันที

ถ้า deploy ใหม่ทำให้ webhook handler ของ vendor ตัวใดตัวหนึ่งเริ่ม error rate สูงผิดปกติ หรือ provisioning queue เริ่มค้างสะสม ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก [[support-cases/synthetic-hr-onboarding/case-8669]]

## ขั้นตอน

deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip ขั้นตอน smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม
