---
layer: business-logic
tags: [fleet, fault, policy]
created: 2026-02-07
links:
  - "[[structure/synthetic-warehouse-robotics/module-fleet-controller]]"
  - "[[business-logic/synthetic-warehouse-robotics/robot-fault-escalation-policy-edge-cases]]"
---

# นโยบายการยกระดับ Fault ของหุ่นยนต์

หุ่นยนต์ที่ขาด heartbeat เกิน `FLEET_OFFLINE_THRESHOLD_BEATS` ครั้งติดต่อกัน จะถูก [[structure/synthetic-warehouse-robotics/module-fleet-controller]] เปลี่ยนสถานะเป็น `fault` อัตโนมัติและหยุดรับงานใหม่ทันที

fault ถูกจัดหมวดเป็น 3 ระดับ: `warning` (แบตเตอรี่ผิดปกติเล็กน้อย ยังทำงานต่อได้), `degraded` (ทำงานได้แต่ช้าลงอย่างมีนัยสำคัญ), และ `critical` (ต้องปลดออกจากคิวงานทันที)

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-warehouse-robotics/robot-fault-escalation-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
