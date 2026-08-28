---
layer: deployment
tags: [rule-engine, runbook]
created: 2026-07-30
links:
  - "[[structure/synthetic-fraud-detection/module-rule-engine]]"
  - "[[business-logic/synthetic-fraud-detection/rule-override-approval-policy]]"
  - "[[support-cases/synthetic-fraud-detection/case-7853]]"
---

# Rule Engine Update Runbook

ขั้นตอนสำหรับ add, modify, หรือ deactivate rule ใน [[structure/synthetic-fraud-detection/module-rule-engine]] ตาม [[business-logic/synthetic-fraud-detection/rule-override-approval-policy]] — ทุกการเปลี่ยนแปลง rule ต้องผ่าน runbook นี้

## ก่อน activate rule ใหม่

ทดสอบ rule บน 30-day historical signal dataset และ measure false positive rate บน user กลุ่มต่างๆ รวมถึง corporate user ที่มี high velocity จากการใช้งานปกติ (ดู [[support-cases/synthetic-fraud-detection/case-7853]])

## หลัง activate

เฝ้าดู false positive rate อย่างน้อย 1 ชั่วโมงแรก พร้อม on-call ที่พร้อม emergency disable ตามขั้นตอนใน [[business-logic/synthetic-fraud-detection/rule-override-approval-policy]]
