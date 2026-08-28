---
layer: structure
tags: [certificate, module]
created: 2025-11-15
links:
  - "[[structure/synthetic-e-learning/module-progress-tracker]]"
  - "[[structure/synthetic-e-learning/module-assessment-engine]]"
  - "[[business-logic/synthetic-e-learning/certificate-expiry-policy]]"
  - "[[business-logic/synthetic-e-learning/certificate-revocation-policy]]"
  - "[[structure/synthetic-e-learning/queue-architecture]]"
---

# Module: certificate-issuer

ออก certificate ให้ผู้เรียนที่ผ่านเงื่อนไขทั้งหมด ได้แก่ content completion 100% และคะแนน assessment ผ่านเกณฑ์ที่กำหนดในคอร์ส เป็น service เดียวที่ cross-query ทั้ง [[structure/synthetic-e-learning/module-progress-tracker]] และ [[structure/synthetic-e-learning/module-assessment-engine]] เพื่อยืนยันเงื่อนไขก่อนออก certificate ป้องกันการออก certificate ก่อนเวลา

## ฟังก์ชันหลัก
- `evaluateCertificateEligibility(learnerId: string, courseId: string): Promise<EligibilityResult>` — ตรวจสอบว่าผู้เรียน qualify สำหรับ certificate โดย cross-check progress และ assessment score
- `issueCertificate(learnerId: string, courseId: string): Promise<Certificate>` — ออก certificate พร้อม unique certificate ID และ expiry date ตาม [[business-logic/synthetic-e-learning/certificate-expiry-policy]]
- `revokeCertificate(certificateId: string, reason: string): Promise<void>` — ยกเลิก certificate ด้วย audit log ดู [[business-logic/synthetic-e-learning/certificate-revocation-policy]]
- `verifyCertificate(certificateId: string): Promise<VerificationResult>` — ยืนยันความถูกต้องของ certificate สำหรับ third party ที่ต้องการตรวจสอบ

## ความสัมพันธ์กับ module อื่น

subscribe event `assessment.graded` และ `lesson.completed` (ดู [[structure/synthetic-e-learning/queue-architecture]]) เพื่อ trigger eligibility check อัตโนมัติโดยไม่รอให้ผู้เรียน request ก่อน ลดเวลารอ certificate หลังผ่านเงื่อนไข และ prevent race condition ที่เกิดจากการ issue certificate ก่อน progress sync เสร็จ
