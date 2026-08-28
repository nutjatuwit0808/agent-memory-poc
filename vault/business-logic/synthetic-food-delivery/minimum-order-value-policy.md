---
layer: business-logic
tags: [ordering, minimum-value, policy]
created: 2026-04-12
links:
  - "[[structure/synthetic-food-delivery/module-order-router]]"
  - "[[business-logic/synthetic-food-delivery/minimum-order-value-policy-edge-cases]]"
---

# นโยบายมูลค่าออร์เดอร์ขั้นต่ำ

ออร์เดอร์ที่มีมูลค่าสินค้า (ไม่รวมค่าจัดส่งและ surge) ต่ำกว่าค่า minimum ที่ร้านกำหนดจะไม่ถูกส่งให้ [[structure/synthetic-food-delivery/module-order-router]] เลย — ถูก reject ที่ API gateway ก่อน เพื่อไม่ให้ routing logic ต้องจัดการกับออร์เดอร์ที่ไม่ valid

ร้านแต่ละร้านตั้ง minimum ของตัวเองในช่วงที่ QuickBite กำหนด (ปัจจุบัน 50-500 บาท) ค่า default สำหรับร้านที่ไม่ได้ตั้งคือ 100 บาท

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-food-delivery/minimum-order-value-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
