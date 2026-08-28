---
layer: business-logic
tags: [expedite, surcharge, policy]
created: 2026-02-15
links:
  - "[[business-logic/synthetic-supply-chain/expedite-surcharge-policy-edge-cases]]"
---

# นโยบาย Expedite Surcharge สำหรับการจัดส่งเร่งด่วน

เมื่อต้องการสินค้าเร็วกว่า lead time ปกติ ซัพพลายเออร์มีสิทธิ์เรียก expedite surcharge ซึ่งอาจสูงถึง 25-40% ของมูลค่าสินค้า ระบบจะแสดง estimated surcharge ให้ทีม procurement เห็นก่อนยืนยัน PO ประเภท expedite เพื่อให้ตัดสินใจได้รับข้อมูลครบ

Expedite order ต้องมีผู้อนุมัติเพิ่มขึ้นตามมูลค่า: ต่ำกว่า 100,000 บาท — manager, 100,000-500,000 บาท — director, เกิน 500,000 บาท — VP procurement ขั้นตอนนี้ช้ากว่า PO ปกติ แต่จำเป็นเพื่อป้องกันการใช้ expedite เป็น workaround แทนการวางแผน replenishment ที่ดี

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-supply-chain/expedite-surcharge-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
