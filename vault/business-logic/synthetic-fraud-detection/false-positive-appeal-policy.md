---
layer: business-logic
tags: [appeal, false-positive, policy]
created: 2025-10-22
links:
  - "[[structure/synthetic-fraud-detection/module-case-manager]]"
  - "[[business-logic/synthetic-fraud-detection/analyst-review-sla-policy]]"
  - "[[business-logic/synthetic-fraud-detection/false-positive-appeal-policy-edge-cases]]"
---

# นโยบายการ Appeal กรณี False Positive

ผู้ใช้ที่ถูก block โดย ShieldAI มีสิทธิ์ยื่น appeal ผ่าน customer support ภายใน 7 วันหลัง block เพื่อให้ analyst ตรวจสอบ การ appeal ไม่ได้ reverse block ทันที — analyst ต้องตรวจสอบและ resolve ใน [[structure/synthetic-fraud-detection/module-case-manager]] ก่อน

[[structure/synthetic-fraud-detection/module-case-manager]] จะสร้าง appeal case ที่มี priority สูงกว่า case ปกติ เพื่อให้ review ภายใน SLA ที่สั้นกว่า (ดู [[business-logic/synthetic-fraud-detection/analyst-review-sla-policy]]) เพราะผู้ใช้ที่ถูก block กำลังรอใช้งาน service อยู่

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-fraud-detection/false-positive-appeal-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
