---
layer: convention
tags: [logging, observability]
created: 2025-11-04
links:
  - "[[deployment/synthetic-recruitment-ats/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับผู้สมัครต้องมี `candidateId` เสมอ เพื่อไล่ log ข้าม service ได้ (resume-parser → candidate-pipeline-tracker → offer-approval-workflow) ดู [[deployment/synthetic-recruitment-ats/monitoring-alerts]]

## ข้อมูลส่วนบุคคล

ห้าม log เนื้อหา resume ดิบหรือผลตรวจสอบประวัติแบบเต็มเด็ดขาด — log ได้แค่ metadata เช่น fileId, checkId, สถานะ เพื่อรักษาความเป็นส่วนตัวของผู้สมัคร
