---
layer: business-logic
tags: [compliance, deadline, policy]
created: 2026-07-09
links:
  - "[[structure/synthetic-e-learning/module-compliance-deadline-monitor]]"
  - "[[business-logic/synthetic-e-learning/mandatory-compliance-deadline-policy-edge-cases]]"
---

# นโยบาย Deadline สำหรับ Compliance Training บังคับ

Compliance training ที่กำหนดโดย regulation หรือ internal policy มี deadline ที่ต้องทำให้เสร็จ พนักงานที่ไม่ทำให้เสร็จภายใน deadline จะถูก flag เป็น non-compliant ใน HR system และ manager จะได้รับ escalation notification

[[structure/synthetic-e-learning/module-compliance-deadline-monitor]] ส่ง reminder ล่วงหน้าตาม `REMINDER_ADVANCE_DAYS` และ escalate ไปยัง manager หลัง deadline เลยไป `ESCALATION_DELAY_DAYS` วัน การ escalate ไม่ใช่ punitive action แต่เพื่อให้ manager ช่วย unblock พนักงานที่อาจมีอุปสรรค เช่น ไม่มี license เข้าระบบ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-e-learning/mandatory-compliance-deadline-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
