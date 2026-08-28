---
layer: convention
tags: [calibration, records]
created: 2025-10-28
links:
  - "[[business-logic/synthetic-quality-control/inspection-record-retention-policy]]"
---

# Calibration Record Format

บันทึก calibration ต้องสมบูรณ์พอที่จะ reproduce ผลได้ถ้ามีการ dispute — convention นี้กำหนด field ขั้นต่ำ

## Field ที่บังคับมี

`instrument_id`, `calibrated_by` (พนักงาน ID), `calibration_date`, `next_due_date`, `reference_standard_id`, `before_value`, `after_value`, `pass_fail`

## การเก็บรักษา

บันทึก calibration ต้องเก็บตาม [[business-logic/synthetic-quality-control/inspection-record-retention-policy]] ไม่ลบทิ้งแม้ instrument จะถูก retire ไปแล้ว
