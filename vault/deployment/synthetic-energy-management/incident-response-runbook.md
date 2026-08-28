---
layer: deployment
tags: [incident, runbook]
created: 2025-12-18
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = คำสั่งควบคุมอุปกรณ์ safety-critical ผิดพลาดหรือ demand response ทำงานผิดจนเสี่ยงไฟดับ, Sev2 = กระทบข้อมูลบิลหรือรายงานคาร์บอน, Sev3 = กระทบเล็กน้อยไม่ถึงการควบคุมอุปกรณ์จริง

## กรณีที่เกี่ยวกับความปลอดภัย

ทุกเหตุการณ์ที่เกี่ยวข้องกับอุปกรณ์ safety-critical ต้องยกระดับเป็น Sev1 เสมอและแจ้งทีมความปลอดภัยของอาคารทันที เขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง
