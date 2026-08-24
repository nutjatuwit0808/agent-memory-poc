---
layer: business-logic
tags: [aggregation, trip, policy]
created: 2025-09-07
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-trip-aggregator]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/trip-boundary-policy-edge-cases]]"
---

# นโยบายกำหนดจุดเริ่ม/จบทริป

[[structure/synthetic-iot-fleet-tracker/module-trip-aggregator]] ถือว่าทริปใหม่เริ่มเมื่อรถเริ่มเคลื่อนที่ (ความเร็ว > 5 กม./ชม.) หลังจากจอดนิ่งต่อเนื่องเกิน `TRIP_IDLE_CLOSE_THRESHOLD_MIN` นาที และถือว่าทริปจบเมื่อรถจอดนิ่งครบเวลาเดียวกันอีกครั้ง

การเลือกใช้ "จอดนิ่งครบเวลา" แทนการดูแค่ "ความเร็วเป็นศูนย์" เพราะรถที่ติดไฟแดงหรือจอดรอส่งของสั้นๆ ไม่ควรถูกตัดเป็นทริปแยก จะทำให้รายงานทริปกระจัดกระจายเกินจริง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-iot-fleet-tracker/trip-boundary-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
