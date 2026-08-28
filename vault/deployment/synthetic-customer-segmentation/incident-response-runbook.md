---
layer: deployment
tags: [incident, runbook]
created: 2025-10-11
links:
  - "[[support-cases/synthetic-customer-segmentation/case-3137]]"
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = PII leak ไปยัง channel หรือ data loss ของ event, Sev2 = export ล้มเหลวทั้งหมดหรือ membership corrupt, Sev3 = health alert false positive หรือ single segment มีปัญหาเล็กน้อย

## กรณี PII incident

ต้องแจ้ง DPO ภายใน 1 ชั่วโมงและ channel ที่ได้รับข้อมูลทันที ไม่ว่า sev จะเป็นเท่าไหร่ — บทเรียนจาก [[support-cases/synthetic-customer-segmentation/case-3137]]
