---
layer: business-logic
tags: [cancellation, refund, edge-case]
created: 2026-02-26
links:
  - "[[support-cases/synthetic-travel-booking/case-7491]]"
  - "[[business-logic/synthetic-travel-booking/overbooking-prevention-policy]]"
  - "[[business-logic/synthetic-travel-booking/cancellation-refund-proration-policy]]"
---

# ข้อยกเว้น: ยกเลิกเพราะความผิดพลาดฝั่งซัพพลายเออร์

ถ้าการยกเลิกเกิดจากความผิดพลาดที่พิสูจน์ได้ฝั่งซัพพลายเออร์ (เช่น [[support-cases/synthetic-travel-booking/case-7491]] หรือกรณี overbooking ตาม [[business-logic/synthetic-travel-booking/overbooking-prevention-policy]]) จะคืนเงินเต็มจำนวนเสมอไม่ว่า rate code จะเป็น non-refundable หรือไม่ และไม่นับเป็นการยกเลิกที่ริเริ่มโดยลูกค้า

ค่าธรรมเนียมที่เก็บไปแล้วในกรณีนี้ต้องคืนแยกจาก flow ปกติ เพราะ `processRefund` มาตรฐานไม่รองรับการคืน fee ที่เก็บไปแล้ว — ต้องใช้ manual reversal ผ่านทีม finance เท่านั้น

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-travel-booking/cancellation-refund-proration-policy]] ("นโยบายการคำนวณเงินคืนตามสัดส่วนเวลา (Proration)") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
