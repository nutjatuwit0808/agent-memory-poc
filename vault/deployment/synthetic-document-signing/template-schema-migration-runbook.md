---
layer: deployment
tags: [migration, runbook]
created: 2026-01-30
links:
  - "[[structure/synthetic-document-signing/module-template-manager]]"
  - "[[support-cases/synthetic-document-signing/case-4265]]"
---

# Template Schema Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อต้องเปลี่ยนโครงสร้าง merge field หรือรูปแบบเนื้อหาของ [[structure/synthetic-document-signing/module-template-manager]] ต้อง migrate ตามขั้นตอนนี้เสมอ ห้ามแก้ template ที่ publish แล้วตรงๆ

## ขั้นตอน

1) สร้าง template version ใหม่ผ่าน `publishTemplateVersion` เสมอ ไม่แก้ version เดิม 2) ตรวจสอบว่า envelope ที่กำลังสร้างอยู่ (draft ที่ยังไม่ finalize) ใช้ version ไหน แจ้งผู้ใช้ให้ refresh ถ้า version เปลี่ยน (ดู [[support-cases/synthetic-document-signing/case-4265]]) 3) เก็บ version เก่าไว้อ่านอย่างเดียวสำหรับ envelope ที่ completed แล้วเสมอ ไม่ลบทิ้ง
