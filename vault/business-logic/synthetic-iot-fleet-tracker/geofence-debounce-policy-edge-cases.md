---
layer: business-logic
tags: [geofence, edge-case]
created: 2025-12-17
links:
  - "[[business-logic/synthetic-iot-fleet-tracker/geofence-debounce-policy]]"
---

# ข้อยกเว้นสำหรับโซนห้ามเข้าความสำคัญสูง

โซนที่ลูกค้าตั้งค่าเป็น `restricted` (เช่น เขตห้ามรถบรรทุกสารเคมีเข้า) ไม่ใช้ debounce ตามปกติ — ping เดียวที่เข้าโซนก็ trigger event ทันที เพราะความเสี่ยงจากการแจ้งเตือนช้าสูงกว่าความรำคาญจาก false positive ไม่กี่ครั้ง

ในทางกลับกัน event ออกจากโซน `restricted` ยังคงใช้ debounce ตามปกติ เพื่อไม่ให้ปิดการแจ้งเตือนเร็วเกินไปทั้งที่รถอาจแค่ขยับออกไปติดขอบเขตแล้ววนกลับเข้ามาใหม่

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-iot-fleet-tracker/geofence-debounce-policy]] ("นโยบายกันสัญญาณ GPS กระตุกที่ขอบโซน") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
