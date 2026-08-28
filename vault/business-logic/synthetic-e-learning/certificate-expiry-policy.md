---
layer: business-logic
tags: [certificate, expiry, policy]
created: 2025-11-13
links:
  - "[[structure/synthetic-e-learning/module-compliance-deadline-monitor]]"
  - "[[business-logic/synthetic-e-learning/certificate-expiry-policy-edge-cases]]"
---

# นโยบายอายุและการต่ออายุ Certificate

Certificate มีอายุตามที่กำหนดในแต่ละคอร์ส คอร์ส compliance ที่กำหนดโดย regulation มักมีอายุ 1-2 ปี ส่วนคอร์สทักษะทั่วไปอาจไม่มีวันหมดอายุหรืออายุ 3-5 ปี อายุ certificate ถูกตั้งใน course metadata โดย content admin

ระบบจะแจ้งเตือนผู้เรียน 60 วันก่อน certificate หมดอายุเพื่อให้มีเวลา refresh training [[structure/synthetic-e-learning/module-compliance-deadline-monitor]] รับผิดชอบการส่ง reminder นี้สำหรับ compliance certificate โดยเฉพาะ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-e-learning/certificate-expiry-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
