---
layer: business-logic
tags: [pricing, currency, policy]
created: 2026-01-03
links:
  - "[[business-logic/synthetic-travel-booking/currency-conversion-policy-edge-cases]]"
---

# นโยบายการแปลงสกุลเงิน

ราคาที่ซัพพลายเออร์ส่งมาอาจเป็นสกุลเงินท้องถิ่นของที่พัก ระบบต้องแปลงเป็นสกุลเงินที่ผู้ใช้เลือกแสดงก่อนคำนวณราคาสุดท้ายเสมอ โดยใช้ FX rate ที่ดึงมาไม่เกิน 1 ชั่วโมงก่อนหน้า

การปัดเศษหลังแปลงสกุลเงินต้องปัดขึ้นเป็นหน่วยที่เล็กที่สุดของสกุลเงินปลายทางเสมอ (เช่น สตางค์สำหรับ THB, cent สำหรับ USD) และต้องทำหลังแปลงเสร็จเพียงครั้งเดียว ห้ามปัดเศษซ้ำหลายรอบระหว่างขั้นตอนคำนวณ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-travel-booking/currency-conversion-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
