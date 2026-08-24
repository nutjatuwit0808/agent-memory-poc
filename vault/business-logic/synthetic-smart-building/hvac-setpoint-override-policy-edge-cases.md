---
layer: business-logic
tags: [hvac, override, edge-case]
created: 2026-07-09
links:
  - "[[business-logic/synthetic-smart-building/hvac-setpoint-override-policy]]"
---

# ข้อยกเว้นเมื่อ Sensor ของโซนที่ Override ค้างอยู่ Stale

ถ้า sensor ของโซนที่กำลังมี manual override ค้างอยู่ถูก flag เป็น stale (ไม่อัปเดตเกิน `HVAC_STALE_SENSOR_MS`) ระบบจะไม่ยกเลิก override ทันที แต่จะหยุดปรับ damper เพิ่มเติมและคง damper position ล่าสุดที่รู้ว่าปลอดภัยไว้แทน เพราะการเชื่อค่า setpoint แต่คำนวณ damper จากอุณหภูมิที่ไม่รู้ว่าจริงหรือไม่อาจทำให้ overshoot ไปทิศทางใดทิศทางหนึ่งได้

กรณีนี้ต่างจาก sensor stale ตอนไม่มี override ซึ่งระบบจะ fallback ไปใช้ค่าเฉลี่ยของโซนข้างเคียงแทน — แต่ตอนมี manual override ทีมตัดสินใจว่าการ "ค้างไว้เท่าที่รู้ล่าสุด" ปลอดภัยกว่าเดาอุณหภูมิจากโซนอื่นที่คนอาจตั้งใจให้ต่างกันอยู่แล้ว

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-smart-building/hvac-setpoint-override-policy]] ("นโยบายการ Override Setpoint ของ HVAC") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
