---
layer: structure
tags: [iot-fleet-tracker, trackgrid, boundaries]
created: 2026-08-05
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-gps-ingest]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-geofence-engine]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-trip-aggregator]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-iot-fleet-tracker/module-gps-ingest]] เป็นเจ้าของ raw ping เท่านั้น ไม่รู้จัก concept ของ "geofence" หรือ "trip" เลย ส่วน [[structure/synthetic-iot-fleet-tracker/module-geofence-engine]] เป็นเจ้าของ zone definition และ event เข้า-ออกโซน โดยไม่เก็บ ping ดิบซ้ำ

[[structure/synthetic-iot-fleet-tracker/module-trip-aggregator]] เป็น service เดียวที่ query ข้าม ping ดิบจาก [[structure/synthetic-iot-fleet-tracker/module-gps-ingest]] และ event จาก [[structure/synthetic-iot-fleet-tracker/module-geofence-engine]] พร้อมกันเพื่อประกอบเป็นทริป — เหตุผลที่ยอมให้ service นี้ทำ cross-domain query (ผิดหลักทั่วไป) คือการสรุปทริปต้องเห็นทั้งเส้นทางดิบและจุด stop ที่มีความหมายทางธุรกิจพร้อมกัน ถ้าแยกกันคำนวณจะได้ระยะทางไม่ตรงกับที่ลูกค้าเห็นจริง
