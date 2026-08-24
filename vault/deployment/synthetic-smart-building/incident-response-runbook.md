---
layer: deployment
tags: [incident, runbook]
created: 2026-07-07
links:
  - "[[structure/synthetic-smart-building/module-access-control-gateway]]"
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = กระทบความปลอดภัยทางกายภาพหรือหยุดทั้งอาคาร, Sev2 = กระทบบางโซน/บาง service, Sev3 = กระทบเล็กน้อยไม่ถึงพนักงานปลายทาง

## กรณี near-miss ด้านความปลอดภัย

ทุกเหตุการณ์ที่เกี่ยวกับ [[structure/synthetic-smart-building/module-access-control-gateway]] ในบริบททางออกฉุกเฉิน แม้จะไม่มีใครติดอยู่จริง ต้องยกระดับเป็น Sev1 เสมอและเขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง
