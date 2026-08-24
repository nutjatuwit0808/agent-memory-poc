---
layer: deployment
tags: [incident, runbook]
created: 2026-04-02
links:
  - "[[structure/synthetic-document-signing/module-audit-trail-logger]]"
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = กระทบความถูกต้องของ audit trail หรือลำดับการเซ็น, Sev2 = กระทบบาง feature เช่น reminder/notary, Sev3 = กระทบเล็กน้อยไม่ถึงความถูกต้องทางกฎหมายของเอกสาร

## กรณีที่กระทบ Audit Trail

ทุกเหตุการณ์ที่ [[structure/synthetic-document-signing/module-audit-trail-logger]] มีปัญหา ไม่ว่าจะเป็น chain ขาดหรือ event เรียงผิดลำดับ ต้องยกระดับเป็น Sev1 เสมอและเขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง เพราะกระทบความน่าเชื่อถือทางกฎหมายของทุกเอกสารในระบบ ไม่ใช่แค่ envelope เดียว
