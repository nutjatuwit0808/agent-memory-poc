---
layer: business-logic
tags: [task, dedup, policy]
created: 2026-05-14
links:
  - "[[support-cases/synthetic-hr-onboarding/case-5546]]"
---

# นโยบายป้องกัน Task ซ้ำ

`generateTaskList` ต้องเช็คก่อนเสมอว่ามี task ประเภทเดียวกันสำหรับ `hireId` นี้อยู่แล้วหรือไม่ ก่อนสร้างใหม่ — ใช้ unique constraint ระดับ database บน `(hireId, taskType)` ไม่ใช่แค่เช็คใน application layer เพื่อกันกรณี concurrent call

เหตุผลที่ต้องกันที่ database layer ด้วย เพราะเคยเกิดเหตุการณ์ retry ของ event consumer ทำให้ `generateTaskList` ถูกเรียกซ้ำในเวลาไล่เลี่ยกันมาก ดู [[support-cases/synthetic-hr-onboarding/case-5546]]
