---
layer: business-logic
tags: [work-order, escalation, policy]
created: 2025-12-06
links:
  - "[[support-cases/synthetic-fleet-maintenance/case-4709]]"
  - "[[business-logic/synthetic-fleet-maintenance/work-order-priority-escalation-policy-edge-cases]]"
---

# นโยบาย Escalation Priority ของ Work Order

work order ที่เปิดอยู่เกิน `WO_ESCALATION_THRESHOLD_HOURS` โดยไม่มีความคืบหน้า (ไม่มีการ assign ช่างหรือ update status) จะถูก escalate priority เป็น `high` อัตโนมัติและแจ้ง Fleet Manager

work order priority `critical` ต้องมีช่างรับงานภายใน 2 ชั่วโมงและเริ่มดำเนินการภายใน 4 ชั่วโมง ถ้าเกินนี้จะ escalate ไปยัง Operations Director

## ทำไมไม่ escalate ทุก work order เป็น critical

การ escalate มากเกินทำให้ Fleet Manager ชาชินและเริ่มเพิกเฉย ดู [[support-cases/synthetic-fleet-maintenance/case-4709]] สำหรับกรณีที่เกิดขึ้นเมื่อ escalation ถูก override บ่อยจนไม่มีความหมาย

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-fleet-maintenance/work-order-priority-escalation-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
