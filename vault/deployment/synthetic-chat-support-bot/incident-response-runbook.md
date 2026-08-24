---
layer: deployment
tags: [incident, runbook]
created: 2026-01-18
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = bot ตอบผิดเป็นวงกว้างหรือเจ้าหน้าที่รับบทสนทนาไม่ได้เลย, Sev2 = กระทบบาง organization/บาง service, Sev3 = กระทบเล็กน้อยไม่ถึงลูกค้าปลายทาง

## กรณี PII near-miss

ทุกเหตุการณ์ที่เกี่ยวข้องกับการรั่วไหลหรือเกือบรั่วไหลของข้อมูลอ่อนไหว แม้จะถูกจับได้ก่อนถึงลูกค้าจริง ต้องยกระดับเป็น Sev1 เสมอและเขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง
