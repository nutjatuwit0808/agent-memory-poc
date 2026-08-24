---
layer: deployment
tags: [migration, runbook]
created: 2025-11-11
links:
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
  - "[[structure/synthetic-smart-building/module-occupancy-sensor-hub]]"
  - "[[structure/synthetic-smart-building/module-access-control-gateway]]"
  - "[[convention/synthetic-smart-building/building-zone-id-convention]]"
---

# Floor Plan Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่ออาคารปรับผังพื้นที่ใหม่ (ย้ายผนัง, รวม/แยกห้องประชุม) ต้อง migrate zone mapping ทั้งหมดใน [[structure/synthetic-smart-building/module-hvac-controller]], [[structure/synthetic-smart-building/module-occupancy-sensor-hub]], และ [[structure/synthetic-smart-building/module-access-control-gateway]] พร้อมกัน

## ขั้นตอน

1) deprecate zoneId เดิมตาม [[convention/synthetic-smart-building/building-zone-id-convention]] 2) สร้าง zoneId ใหม่พร้อม mapping sensor/actuator ที่ผูกกับพื้นที่จริง 3) ทดสอบ occupancy และ HVAC ของโซนใหม่อย่างน้อย 3 วันก่อนปิด zoneId เดิมถาวร
