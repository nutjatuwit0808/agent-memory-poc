---
layer: business-logic
tags: [demand-response, policy]
created: 2026-02-04
links:
  - "[[business-logic/synthetic-energy-management/demand-threshold-load-shedding-policy-edge-cases]]"
---

# นโยบายการลดโหลดเมื่อ Demand เกิน Threshold

เมื่อ demand ปัจจุบันของ facility เกิน `DEMAND_THRESHOLD_KW_DEFAULT` ระบบจะ trigger load shedding อัตโนมัติตามลำดับความสำคัญของอุปกรณ์ที่กำหนดไว้ล่วงหน้า อุปกรณ์ที่ไม่กระทบการดำเนินงานหลักจะถูกปิดก่อนเสมอ

หลัง trigger load shedding แล้ว ระบบจะไม่ trigger ซ้ำสำหรับ facility เดียวกันภายใน `LOAD_SHED_COOLDOWN_MIN` นาที เพื่อป้องกันการเปิด-ปิดอุปกรณ์ถี่เกินไปจนกระทบอายุการใช้งาน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-energy-management/demand-threshold-load-shedding-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
