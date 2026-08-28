---
layer: business-logic
tags: [supplier, onboarding, policy]
created: 2026-03-09
links:
  - "[[structure/synthetic-supply-chain/module-supplier-catalog]]"
---

# นโยบาย Onboarding ซัพพลายเออร์ใหม่

ซัพพลายเออร์ใหม่ต้องผ่านกระบวนการ qualification ซึ่งประกอบด้วยการตรวจสอบเอกสารบริษัท การตรวจสอบ compliance ด้านแรงงานและสิ่งแวดล้อม และการทำ pilot order อย่างน้อย 2 ครั้งก่อนจะได้รับสถานะ active ใน [[structure/synthetic-supply-chain/module-supplier-catalog]]

ระหว่าง pilot order ซัพพลายเออร์ใหม่จะถูก flag เป็น `probationary` ซึ่งต้องผ่านการอนุมัติพิเศษทุก PO และจะถูก inspect 100% แทน sampling เพื่อสร้างข้อมูล quality baseline ก่อนจะได้รับสิทธิ์ AQL ปกติ
