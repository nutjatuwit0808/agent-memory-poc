---
layer: convention
tags: [logging, observability]
created: 2026-01-25
links:
  - "[[deployment/synthetic-e-learning/monitoring-alerts]]"
  - "[[support-cases/synthetic-e-learning/case-6289]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ learner activity ต้องมี `learnerId` และ `courseId` เสมอ เพื่อไล่ log ข้าม service ได้ (progress-tracker → assessment-engine → certificate-issuer) ดู [[deployment/synthetic-e-learning/monitoring-alerts]]

## ระดับ log

Certificate issuance และ revocation ต้อง log เป็น `info` ขึ้นไปเสมอ compliance deadline miss ต้อง log เป็น `warn` background job failure ต้องไม่ suppress — บทเรียนจาก [[support-cases/synthetic-e-learning/case-6289]]
