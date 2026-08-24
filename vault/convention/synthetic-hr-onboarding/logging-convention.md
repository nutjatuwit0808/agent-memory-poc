---
layer: convention
tags: [logging, observability]
created: 2026-01-30
links:
  - "[[deployment/synthetic-hr-onboarding/monitoring-alerts]]"
  - "[[support-cases/synthetic-hr-onboarding/case-3704]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ case ต้องมี `hireId` เสมอ เพื่อไล่ log ข้าม service ได้ (onboarding-workflow-engine → document-collection → access-provisioning) ดู [[deployment/synthetic-hr-onboarding/monitoring-alerts]]

## ระดับ log

webhook ที่ถูก reject หรือไม่รู้จัก log เป็น `error` เสมอแม้จะดูเหมือนเรื่องเล็ก เพราะบทเรียนจาก [[support-cases/synthetic-hr-onboarding/case-3704]] คือความเงียบทำให้ปัญหาไม่ถูกพบเร็ว
