---
layer: business-logic
tags: [scheduling, policy]
created: 2026-01-26
links:
  - "[[structure/synthetic-energy-management/module-equipment-scheduler]]"
  - "[[business-logic/synthetic-energy-management/equipment-maintenance-lockout-policy-edge-cases]]"
---

# นโยบายการล็อกอุปกรณ์ระหว่างบำรุงรักษา

อุปกรณ์ที่อยู่ระหว่างบำรุงรักษาต้องถูก mark เป็น 'maintenance lockout' ใน [[structure/synthetic-energy-management/module-equipment-scheduler]] ซึ่งจะปฏิเสธคำสั่งเปิด-ปิดจากทุกแหล่งรวมถึง demand response โดยอัตโนมัติ จนกว่าทีมบำรุงรักษาจะปลดล็อกด้วยมือ

การ mark lockout ต้องระบุเหตุผลและระยะเวลาที่คาดว่าจะเสร็จเสมอ ระบบจะแจ้งเตือนถ้า lockout ค้างเกินระยะเวลาที่ระบุไว้โดยไม่มีการปลดล็อก

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-energy-management/equipment-maintenance-lockout-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
