---
layer: business-logic
tags: [alerting, throttling, policy]
created: 2026-04-28
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/alert-throttling-policy-edge-cases]]"
---

# นโยบาย Throttle การแจ้งเตือน

[[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]] จำกัดจำนวนแจ้งเตือนประเภทเดียวกันสำหรับอุปกรณ์เดียวกันไม่ให้เกิน 1 ครั้งต่อ `ALERT_THROTTLE_WINDOW_SEC` เพื่อไม่ให้ลูกค้าโดนแจ้งเตือนถี่ยิบจากเหตุการณ์ที่เกิดซ้ำในช่วงเวลาสั้นๆ (เช่น เข้า-ออกโซนติดกันจากการวิ่งเลียบขอบเขต)

การ throttle นับแยกตามคู่ (deviceId, alertType) เสมอ ไม่ throttle ข้ามประเภท เพื่อไม่ให้แจ้งเตือนความเร็วเกินไปบัง alert เรื่อง offline ที่สำคัญกว่า

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-iot-fleet-tracker/alert-throttling-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
