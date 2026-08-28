---
layer: business-logic
tags: [case-management, sla, policy]
created: 2025-12-31
links:
  - "[[structure/synthetic-fraud-detection/module-case-manager]]"
  - "[[business-logic/synthetic-fraud-detection/analyst-review-sla-policy-edge-cases]]"
---

# นโยบาย SLA การ Review Case ของ Analyst

case ที่ [[structure/synthetic-fraud-detection/module-case-manager]] ส่งเข้า review queue มี SLA ตามประเภท: high-risk case (score 70-79) ต้อง review ภายใน 2 ชั่วโมง, medium-risk case (score 50-69) ภายใน 8 ชั่วโมง, appeal case ภายใน 1 ชั่วโมงเสมอ

ถ้า case อยู่ใน queue เกิน 80% ของ SLA แล้วยังไม่มี analyst รับ ระบบจะ escalate อัตโนมัติไปยัง senior analyst และส่ง alert ให้ Fraud Ops lead รับทราบ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-fraud-detection/analyst-review-sla-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
