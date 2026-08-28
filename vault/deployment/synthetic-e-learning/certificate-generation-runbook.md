---
layer: deployment
tags: [certificate, runbook]
created: 2026-01-07
links:
  - "[[structure/synthetic-e-learning/module-progress-tracker]]"
  - "[[structure/synthetic-e-learning/module-assessment-engine]]"
---

# Certificate Generation & Verification Runbook

ขั้นตอนสำหรับ troubleshoot เมื่อ certificate ไม่ถูกออกแม้ learner ผ่านเงื่อนไขแล้ว และขั้นตอนสำหรับ verify certificate ที่ third party ต้องการยืนยัน

## Troubleshoot certificate ไม่ถูกออก

1) ตรวจ `evaluateCertificateEligibility` ด้วยมือว่า return eligible หรือไม่ 2) ตรวจ progress ใน [[structure/synthetic-e-learning/module-progress-tracker]] ว่า completion event มีอยู่จริง 3) ตรวจ assessment score ใน [[structure/synthetic-e-learning/module-assessment-engine]] ว่าผ่าน threshold ของ course นั้น 4) ตรวจ event queue ว่า `assessment.graded` event ถึง certificate-issuer หรือไม่

## Manual certificate issuance

ถ้า eligibility ผ่านทุก check แต่ระบบยังไม่ออก certificate ให้ manual trigger `issueCertificate` หลังยืนยันว่า eligibility ผ่านจริง บันทึกเหตุผลใน audit log ทุกครั้งที่ manual issue และ report เป็น incident ถ้ามี pattern เกิดซ้ำ
