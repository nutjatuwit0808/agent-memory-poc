---
layer: deployment
tags: [incident, runbook]
created: 2026-08-09
links:
  - "[[business-logic/synthetic-analytics-pipeline/pii-classification-policy]]"
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = ข้อมูลผิดพลาดกระทบ dashboard ระดับผู้บริหารหรือมี PII หลุด, Sev2 = กระทบ dataset บางตัวหรือทีมเดียว, Sev3 = กระทบเล็กน้อยไม่ถึงผู้ใช้ปลายทาง

## กรณี PII หลุด

ทุกเหตุการณ์ที่เกี่ยวกับ [[business-logic/synthetic-analytics-pipeline/pii-classification-policy]] ต้องยกระดับเป็น Sev1 เสมอไม่ว่าขอบเขตจะเล็กแค่ไหน และแจ้งทีม security ทันทีควบคู่กับการเขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง
