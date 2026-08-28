---
layer: deployment
tags: [incident, runbook]
created: 2025-10-18
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = double credit หรือ redemption ผิดพลาด mass, Sev2 = partner sync down หรือ expiry job ล้มเหลว, Sev3 = monitoring alert ที่รอได้

## กรณี double credit หรือ double debit

ทุกเหตุการณ์ที่กระทบ balance ของสมาชิกต้องยกระดับเป็น Sev1 ทันทีและเขียน postmortem พร้อม root cause analysis ภายใน 48 ชั่วโมง
