---
layer: business-logic
tags: [maintenance, interval, policy]
created: 2026-04-25
links:
  - "[[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]]"
  - "[[structure/synthetic-fleet-maintenance/module-work-order-manager]]"
  - "[[business-logic/synthetic-fleet-maintenance/preventive-maintenance-interval-policy-edge-cases]]"
---

# นโยบายช่วงเวลาบำรุงรักษาเชิงป้องกัน

ยานพาหนะต้องเข้ารับการบำรุงรักษาเชิงป้องกันตามเงื่อนไขที่ถึงก่อน ระหว่าง odometer-based (ทุก N กม.) และ time-based (ทุก N วัน) ค่า N ของแต่ละประเภทยานพาหนะและประเภทการบำรุงรักษาเก็บไว้ใน service parameter ของ [[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]]

[[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]] จะ flag ยานพาหนะว่า `due` เมื่อถึงกำหนดตามเงื่อนไขใดเงื่อนไขหนึ่ง และ publish event ให้ [[structure/synthetic-fleet-maintenance/module-work-order-manager]] สร้าง work order อัตโนมัติ ยานพาหนะที่ถูก flag แต่ยังไม่ได้รับ work order ภายใน 48 ชั่วโมงจะถูก escalate

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-fleet-maintenance/preventive-maintenance-interval-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
