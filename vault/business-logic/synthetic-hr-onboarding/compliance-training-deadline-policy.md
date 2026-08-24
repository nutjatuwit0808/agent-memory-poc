---
layer: business-logic
tags: [compliance, training, policy]
created: 2025-11-14
links:
  - "[[business-logic/synthetic-hr-onboarding/compliance-training-deadline-policy-edge-cases]]"
---

# นโยบาย Deadline การอบรมภาคบังคับ

training บังคับทุกประเภท (เช่น อบรมความปลอดภัยข้อมูล, จรรยาบรรณ) มี deadline เริ่มนับจากวันเริ่มงานจริง ไม่ใช่วันที่สร้าง case ค่าปกติคือ `COMPLIANCE_DEFAULT_DEADLINE_DAYS` (30 วัน) และระบบส่ง reminder ล่วงหน้า `COMPLIANCE_REMINDER_LEAD_DAYS` (7 วัน) ก่อนถึงกำหนด

รายการที่เลยกำหนดถูก escalate ไปหาหัวหน้างานโดยตรง ไม่ใช่แค่แจ้งพนักงาน เพราะทีม compliance ถือว่าหัวหน้างานมีหน้าที่ดูแลให้ลูกทีมทำ training บังคับให้เสร็จตามเวลา

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-hr-onboarding/compliance-training-deadline-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
