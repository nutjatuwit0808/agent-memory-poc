---
layer: business-logic
tags: [quarantine, hold, policy]
created: 2025-12-19
links:
  - "[[structure/synthetic-quality-control/module-quarantine-manager]]"
  - "[[business-logic/synthetic-quality-control/quarantine-hold-duration-policy-edge-cases]]"
---

# นโยบายระยะเวลา Quarantine Hold

batch ที่ถูก quarantine จะมี hold duration เริ่มต้นที่ `QUARANTINE_DEFAULT_HOLD_HOURS` (ค่าเริ่มต้น 72 ชั่วโมง) โดยนับจากเวลาที่สร้าง hold ไม่ใช่เวลาที่ rework เสร็จ hold จะไม่หมดอายุอัตโนมัติ — ต้องมีผู้มีอำนาจ release ด้วยมือเสมอ

[[structure/synthetic-quality-control/module-quarantine-manager]] จะส่ง alert เมื่อ hold เหลืออีก `QUARANTINE_EXPIRY_LOOKAHEAD_HOURS` ชั่วโมงก่อนครบกำหนด เพื่อให้ผู้รับผิดชอบเตรียม evidence สำหรับการ release

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-quality-control/quarantine-hold-duration-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
