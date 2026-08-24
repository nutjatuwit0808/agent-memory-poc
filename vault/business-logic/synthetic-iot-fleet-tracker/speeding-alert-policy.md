---
layer: business-logic
tags: [safety, policy]
created: 2025-11-17
links:
  - "[[business-logic/synthetic-iot-fleet-tracker/alert-throttling-policy]]"
---

# นโยบายแจ้งเตือนความเร็วเกินกำหนด

แต่ละโซนสามารถกำหนดขีดจำกัดความเร็วของตัวเองได้ ถ้าไม่กำหนดจะใช้ค่า default ตามประเภทถนน (ทางหลวง 90 กม./ชม., ในเมือง 60 กม./ชม.) ระบบเทียบความเร็วจาก ping ล่าสุดกับขีดจำกัดที่ใช้ ณ ตำแหน่งนั้น

การแจ้งเตือนความเร็วเกินไม่ throttle ตาม [[business-logic/synthetic-iot-fleet-tracker/alert-throttling-policy]] เหมือนแจ้งเตือนอื่น แต่ใช้ debounce แยกต่างหาก (ต้องเกินติดต่อกันอย่างน้อย 30 วินาที) เพื่อไม่ให้ความเร็วกระตุกจาก GPS noise ทำให้แจ้งเตือนเท็จ
