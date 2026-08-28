---
layer: business-logic
tags: [downtime, sla, policy]
created: 2026-04-03
links:
  - "[[structure/synthetic-fleet-maintenance/module-downtime-tracker]]"
  - "[[business-logic/synthetic-fleet-maintenance/downtime-sla-threshold-policy-edge-cases]]"
---

# นโยบาย SLA Threshold ของ Vehicle Downtime

ยานพาหนะแต่ละคันมี downtime SLA ที่ตกลงไว้กับลูกค้าที่เช่าหรือใช้งาน โดยทั่วไปไม่เกิน X ชั่วโมงต่อเดือน [[structure/synthetic-fleet-maintenance/module-downtime-tracker]] แจ้งเตือนเมื่อ downtime accumulated ถึง `DOWNTIME_SLA_WARNING_PCT`% ของ SLA limit เพื่อให้ Fleet Manager รับทราบก่อนเกิน

เมื่อ downtime เกิน SLA จริง ระบบจะแจ้ง Fleet Manager และ Account Manager ที่รับผิดชอบลูกค้ารายนั้นพร้อมกัน เพื่อให้ประสานงานกับลูกค้าและจัดรถสำรองได้ทันท่วงที

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-fleet-maintenance/downtime-sla-threshold-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
