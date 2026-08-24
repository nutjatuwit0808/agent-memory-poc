---
layer: business-logic
tags: [aggregation, edge-case]
created: 2026-08-09
links:
  - "[[business-logic/synthetic-iot-fleet-tracker/trip-boundary-policy]]"
---

# ข้อยกเว้นสำหรับรถที่ปิดเครื่องยนต์ระหว่างส่งของ

รถบางประเภทดับเครื่องยนต์ขณะแวะส่งของแต่ละจุด (ไม่ idle ทิ้งไว้) ทำให้อุปกรณ์ GPS ที่ต่อไฟจากแบตรถอาจหยุดส่ง ping ชั่วคราว กรณีนี้ trip-aggregator จะไม่ปิดทริปทันทีที่ ping หายไป แต่รอจนกว่าจะครบ `TRIP_IDLE_CLOSE_THRESHOLD_MIN` นับจาก ping สุดท้ายที่ได้รับจริง ไม่ใช่นับจากเวลาที่ควรได้รับ ping

ถ้ารถกลับมาส่ง ping ภายในเวลาไม่เกิน `TRIP_IDLE_CLOSE_THRESHOLD_MIN` หลังดับเครื่อง ระบบจะถือว่าเป็นทริปเดียวกันต่อเนื่อง ไม่ตัดแยกเป็นสองทริป

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-iot-fleet-tracker/trip-boundary-policy]] ("นโยบายกำหนดจุดเริ่ม/จบทริป") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
