---
layer: business-logic
tags: [calibration, instrument, policy]
created: 2025-09-17
links:
  - "[[structure/synthetic-quality-control/module-measurement-collector]]"
  - "[[business-logic/synthetic-quality-control/calibration-interval-policy-edge-cases]]"
---

# นโยบายช่วงเวลาการ Calibrate เครื่องมือวัด

เครื่องมือวัดทุกตัวต้อง calibrate ตามช่วงเวลาที่กำหนดในทะเบียน instrument ซึ่งแตกต่างกันตาม type ของเครื่องมือและความแม่นยำที่ต้องการ โดยทั่วไปอยู่ระหว่าง 30-90 วัน [[structure/synthetic-quality-control/module-measurement-collector]] ติดตาม due date ของแต่ละตัวและ flag เมื่อใกล้ถึงกำหนด

เครื่องมือที่ calibration เกินกำหนดเกิน `CALIBRATION_GRACE_PERIOD_HOURS` จะถูกระงับรับข้อมูลอัตโนมัติ — ข้อมูลที่รับก่อน grace period หมดยังใช้ได้ แต่ข้อมูลหลังจากนั้นต้องทิ้ง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-quality-control/calibration-interval-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
