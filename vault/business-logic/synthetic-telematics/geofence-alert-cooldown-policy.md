---
layer: business-logic
tags: [geofence, policy]
created: 2026-08-12
links:
  - "[[business-logic/synthetic-telematics/geofence-alert-cooldown-policy-edge-cases]]"
---

# นโยบายระยะเวลา Cooldown การแจ้งเตือน Geofence

การแจ้งเตือนเมื่อรถออกนอกเขต geofence มี cooldown อย่างน้อย 30 นาทีต่อกรมธรรม์หนึ่ง เพื่อไม่ให้แจ้งเตือนถี่เกินไปเมื่อรถวิ่งใกล้ขอบเขตพอดีแล้วเข้า-ออกสลับกันหลายรอบ

การกลับเข้าเขตที่กำหนดหลังออกนอกเขตไม่ trigger การแจ้งเตือนแยกต่างหาก มีแค่สรุปสถานะปัจจุบันเมื่อผู้ขับเปิดแอปดูเท่านั้น

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-telematics/geofence-alert-cooldown-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
