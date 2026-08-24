---
layer: business-logic
tags: [background-check, policy]
created: 2026-02-12
links:
  - "[[business-logic/synthetic-hr-onboarding/background-check-gating-policy-edge-cases]]"
---

# นโยบายการกันวันเริ่มงานด้วยผลตรวจประวัติ

พนักงานใหม่จะขยับไป stage `provisioning_pending` ไม่ได้จนกว่าผลตรวจประวัติ (background check) จะกลับมาเป็น `clear` เท่านั้น — ผล `pending` หรือ `flagged` block การขอสิทธิ์เข้าถึงทั้งหมดโดยอัตโนมัติ

โดยเฉลี่ยผลตรวจประวัติใช้เวลา 3-5 วันทำการ ถ้าเกิน 10 วันทำการโดยยังไม่มีผล ระบบจะ escalate ไปหาทีม HR ให้ติดต่อ vendor โดยตรงแทนการรอ webhook

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-hr-onboarding/background-check-gating-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
