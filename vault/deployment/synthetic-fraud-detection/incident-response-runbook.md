---
layer: deployment
tags: [incident, runbook]
created: 2025-12-27
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = fraud decision ผิดพลาดขนาดใหญ่ (false positive rate > 10% หรือ false negative ที่พิสูจน์ได้), Sev2 = กระทบ SLA หรือ queue overflow, Sev3 = degraded performance แต่ decision ยังถูกต้อง

## False positive spike

ถ้า false positive rate เกิน 5% ภายใน 30 นาที ต้อง escalate เป็น Sev1 ทันทีและแจ้ง Customer Support ให้เตรียม handle complaint surge พร้อมกัน
