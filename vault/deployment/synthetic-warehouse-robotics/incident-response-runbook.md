---
layer: deployment
tags: [incident, runbook]
created: 2025-10-17
links:
  - "[[structure/synthetic-warehouse-robotics/module-safety-zone-monitor]]"
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = หยุดทั้งฟลีทหรือกระทบความปลอดภัย, Sev2 = กระทบบางโซน/บาง service, Sev3 = กระทบเล็กน้อยไม่ถึงลูกค้าปลายทาง

## กรณี near-miss ด้านความปลอดภัย

ทุกเหตุการณ์ที่เกี่ยวกับ [[structure/synthetic-warehouse-robotics/module-safety-zone-monitor]] แม้จะไม่มีใครบาดเจ็บจริง ต้องยกระดับเป็น Sev1 เสมอและเขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง
