---
layer: structure
tags: [smart-building, atrium, architecture, overview]
created: 2025-12-06
links:
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
  - "[[structure/synthetic-smart-building/module-occupancy-sensor-hub]]"
  - "[[structure/synthetic-smart-building/module-energy-optimizer]]"
  - "[[structure/synthetic-smart-building/module-access-control-gateway]]"
  - "[[structure/synthetic-smart-building/module-alert-dispatcher]]"
  - "[[structure/synthetic-smart-building/module-maintenance-scheduler]]"
---

# ภาพรวมสถาปัตยกรรม Atrium — ระบบควบคุมอาคารอัจฉริยะ

Atrium คือแพลตฟอร์มควบคุมระบบอาคาร (Building Management System) สำหรับอาคารสำนักงานเชิงพาณิชย์ ครอบคลุมตั้งแต่ระบบปรับอากาศ (HVAC), การตรวจจับการใช้งานพื้นที่ (occupancy), การปรับพลังงานให้เหมาะสม, ระบบควบคุมประตู/บัตรผ่าน, ไปจนถึงการแจ้งเตือนและจัดตารางซ่อมบำรุง Atrium เชื่อมต่อกับฮาร์ดแวร์ของแต่ละอาคารผ่าน edge gateway ที่ติดตั้งในห้องเครื่องแต่ละชั้น ไม่ได้คุยกับ sensor/actuator โดยตรงจาก cloud

อาคารแต่ละหลังถูกแบ่งเป็น "โซน" (zone) ซึ่งอาจเป็นทั้งชั้นหรือส่วนหนึ่งของชั้นก็ได้ ขึ้นกับผังการเดินท่อ HVAC จริง ทีมวิศวกรรมเรียกช่วง 07:00-09:30 ว่า warm-up window เพราะเป็นช่วงที่ระบบต้องปรับอุณหภูมิทุกโซนจาก setback มาสู่ comfort band พร้อมกันก่อนคนเข้าออฟฟิศ ซึ่งเป็นช่วงที่ระบบ HVAC และพลังงานถูกใช้งานหนักที่สุดของวัน

## Module หลัก

- **hvac-controller** — ควบคุมอุณหภูมิและการไหลเวียนอากาศของแต่ละโซนในอาคาร แยกออกมาจาก legacy PLC ladde ดู [[structure/synthetic-smart-building/module-hvac-controller]]
- **occupancy-sensor-hub** — รวบรวมสัญญาณจาก occupancy sensor (PIR ผสม CO2 sensor ในบางโซนประชุม) ของทุกชั้น แล้ว normalize เป็นสถานะ occupied/vacant ต่อโซนให้ module อื่นใช้ต่อ ไม่ตัดสินใจเชิงธุรกิจใดๆ ดู [[structure/synthetic-smart-building/module-occupancy-sensor-hub]]
- **energy-optimizer** — คำนวณ setpoint ที่ประหยัดพลังงานที่สุดโดยยังรักษา comfort band ไว้ ทำงานเป็น bat ดู [[structure/synthetic-smart-building/module-energy-optimizer]]
- **access-control-gateway** — ควบคุมประตูและบัตรผ่านของอาคาร เชื่อมกับ door controller ฮาร์ดแวร์ผ่าน RS-485 bu ดู [[structure/synthetic-smart-building/module-access-control-gateway]]
- **alert-dispatcher** — รับ event จาก module อื่น (fault, safety, energy anomaly) แล้วจัดหมวดความรุนแรงแ ดู [[structure/synthetic-smart-building/module-alert-dispatcher]]
- **maintenance-scheduler** — สร้างและติดตาม work order สำหรับงานซ่อมบำรุง ทั้งจาก fault event อัตโนมัติที่ mo ดู [[structure/synthetic-smart-building/module-maintenance-scheduler]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-smart-building/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-smart-building/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-smart-building/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-smart-building/database-schema]]
