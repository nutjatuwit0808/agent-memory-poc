---
layer: business-logic
tags: [hvac, override, policy]
created: 2026-05-25
links:
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
  - "[[structure/synthetic-smart-building/module-energy-optimizer]]"
  - "[[business-logic/synthetic-smart-building/hvac-setpoint-override-policy-edge-cases]]"
---

# นโยบายการ Override Setpoint ของ HVAC

เมื่อพนักงานตั้ง setpoint เองผ่านแอปหรือ panel ในห้อง (source `manual`) [[structure/synthetic-smart-building/module-hvac-controller]] จะยึด setpoint นั้นไว้และปฏิเสธคำแนะนำจาก [[structure/synthetic-smart-building/module-energy-optimizer]] ทุกครั้งจนกว่าจะครบเวลา override หรือมีคนยกเลิกเอง

manual override มีอายุสูงสุด 4 ชั่วโมงนับจากตั้งค่า หลังจากนั้นระบบจะกลับไปใช้ auto ตามปกติเอง เพื่อไม่ให้คนลืม override ทิ้งไว้ข้ามคืนแล้วเปลืองพลังงานโดยไม่จำเป็น

## ทำไมต้องมีอายุ override

override ที่ไม่มีวันหมดอายุเคยทำให้ห้องประชุมที่มีคนตั้งอุณหภูมิเย็นจัดไว้ครั้งเดียวเมื่อเช้าถูกปรับความเย็นเท่าเดิมไปตลอดทั้งคืนทั้งที่ไม่มีคนใช้งานแล้ว การจำกัดอายุบังคับให้ระบบกลับมาประเมินความจำเป็นใหม่เป็นระยะ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-smart-building/hvac-setpoint-override-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
