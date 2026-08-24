---
layer: business-logic
tags: [geofence, debounce, policy]
created: 2026-03-29
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-geofence-engine]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/geofence-debounce-policy-edge-cases]]"
---

# นโยบายกันสัญญาณ GPS กระตุกที่ขอบโซน

เมื่อรถวิ่งใกล้ขอบเขตของโซน สัญญาณ GPS ที่คลาดเคลื่อนไม่กี่เมตรอาจทำให้ตำแหน่งดูเหมือนเข้า-ออกโซนสลับกันถี่ๆ ทั้งที่รถจอดอยู่จุดเดิม [[structure/synthetic-iot-fleet-tracker/module-geofence-engine]] จึงไม่ publish event เข้า/ออกทันทีที่เห็น ping เดียวข้ามขอบเขต

ต้องเห็น ping ที่อยู่ฝั่งเดียวกันของขอบเขตติดต่อกัน `GEOFENCE_DEBOUNCE_PINGS` ครั้งก่อนถึงจะยืนยัน event เข้า/ออกจริง เพื่อกรอง noise ของสัญญาณดาวเทียมที่คลาดเคลื่อนออกไป

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-iot-fleet-tracker/geofence-debounce-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
