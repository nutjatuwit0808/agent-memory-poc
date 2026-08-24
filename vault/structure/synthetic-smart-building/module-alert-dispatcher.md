---
layer: structure
tags: [alerting, module]
created: 2025-09-20
links:
  - "[[structure/synthetic-smart-building/queue-architecture]]"
  - "[[structure/synthetic-smart-building/module-occupancy-sensor-hub]]"
  - "[[business-logic/synthetic-smart-building/alert-escalation-policy]]"
---

# Module: alert-dispatcher

รับ event จาก module อื่น (fault, safety, energy anomaly) แล้วจัดหมวดความรุนแรงและส่งต่อไปยังช่องทางที่เหมาะสม (page, SMS, digest email) ไม่ได้ตัดสินใจเองว่า "อะไรคือ fault" — module ต้นทางต้องจัดหมวดความรุนแรงมาให้แล้วเสมอ alert-dispatcher ทำหน้าที่แค่ routing และป้องกันการแจ้งซ้ำ

## ฟังก์ชันหลัก
- `dispatchAlert(event: AlertEvent): Promise<void>` — ส่ง alert ไปยังช่องทางตามระดับความรุนแรง
- `escalateAlert(alertId: string): Promise<void>` — ยกระดับ alert ที่ยังไม่มีคน acknowledge ภายในเวลาที่กำหนด
- `suppressDuplicate(event: AlertEvent): boolean` — เช็คว่า event นี้ซ้ำกับที่ส่งไปแล้วในช่วงเวลาสั้นๆ หรือไม่

## ความสัมพันธ์กับ module อื่น

subscribe แทบทุก event หลักในระบบ (ดู [[structure/synthetic-smart-building/queue-architecture]]) รวมถึง `occupancy.changed` จาก [[structure/synthetic-smart-building/module-occupancy-sensor-hub]] เพื่อพิจารณาว่าจะ suppress alert บางประเภทตอนโซนไม่มีคนหรือไม่ ดู [[business-logic/synthetic-smart-building/alert-escalation-policy]]
