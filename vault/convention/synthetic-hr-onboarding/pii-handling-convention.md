---
layer: convention
tags: [pii, privacy]
created: 2026-02-19
links:
  - "[[structure/synthetic-hr-onboarding/module-document-collection]]"
---

# PII Handling Convention

OnboardFlow เก็บข้อมูลส่วนบุคคลจำนวนมาก (เลขบัตรประชาชน, ข้อมูลภาษี, ผลตรวจประวัติ) เอกสารนี้กำหนดกติกาการจัดการที่เข้มกว่า convention ทั่วไป

## ห้าม log เนื้อหา PII

log message ห้ามมีเนื้อหาของแบบฟอร์มหรือผลตรวจประวัติปนอยู่เด็ดขาด แม้จะเป็น debug log ระดับ development ก็ตาม — log ได้แค่ `hireId` และสถานะเท่านั้น

## การเก็บรักษาเอกสาร

เอกสารที่เซ็นแล้วใน [[structure/synthetic-hr-onboarding/module-document-collection]] เข้ารหัสที่ storage layer เสมอ และมี access log แยกต่างหากสำหรับทุกครั้งที่มีการเปิดดูเอกสาร ไม่ใช้ log กลางเดียวกับ log ทั่วไปของระบบ
