---
layer: business-logic
tags: [routing, alerting, policy]
created: 2026-03-24
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-route-optimizer]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/route-deviation-alert-policy-edge-cases]]"
---

# นโยบายแจ้งเตือนเมื่อรถเบี่ยงเบนจากเส้นทางที่วางแผนไว้

เมื่อตำแหน่งจริงของรถห่างจากเส้นทางที่ [[structure/synthetic-iot-fleet-tracker/module-route-optimizer]] วางแผนไว้เกิน 500 เมตรต่อเนื่องเกิน 3 ping ระบบจะถือว่า "เบี่ยงเบน" และให้ [[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]] ตัดสินใจว่าจะแจ้งเตือนลูกค้าหรือไม่ตามกฎการแจ้งเตือนของลูกค้ารายนั้น

การเบี่ยงเบนไม่ได้แปลว่าผิดเสมอไป — คนขับอาจเลี่ยงรถติดหรือถนนปิดเอง ระบบจึงแค่บันทึกและแจ้งเตือนแบบ informational ไม่ block การทำงานใดๆ ของคนขับ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-iot-fleet-tracker/route-deviation-alert-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
