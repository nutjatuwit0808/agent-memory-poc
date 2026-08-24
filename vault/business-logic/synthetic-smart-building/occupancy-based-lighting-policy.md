---
layer: business-logic
tags: [occupancy, lighting, policy]
created: 2026-03-18
links:
  - "[[structure/synthetic-smart-building/module-occupancy-sensor-hub]]"
  - "[[business-logic/synthetic-smart-building/occupancy-based-lighting-policy-edge-cases]]"
---

# นโยบายปิดไฟอัตโนมัติตาม Occupancy

โซนที่ [[structure/synthetic-smart-building/module-occupancy-sensor-hub]] รายงานว่า vacant ต่อเนื่องเกิน 10 นาทีจะถูกสั่งปิดไฟอัตโนมัติผ่าน lighting relay ที่ผูกกับ zone เดียวกับ HVAC

การตัดสิน vacant ต้องผ่าน debounce ตาม `OCCUPANCY_DEBOUNCE_MS` ก่อนเสมอ เพื่อกันกรณีคนนั่งนิ่งนานจน PIR sensor ไม่เห็นการเคลื่อนไหวแล้วตีความผิดว่าห้องว่าง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-smart-building/occupancy-based-lighting-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
