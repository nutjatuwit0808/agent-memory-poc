---
layer: deployment
tags: [incident, runbook]
created: 2025-09-05
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = ใบรับรองที่ออกไปผิดพลาดหรือ batch out-of-spec ออก shipment, Sev2 = SPC system ล่มหรือ quarantine ไม่ทำงาน, Sev3 = alert ผิดพลาดหรือ report ช้า

## กรณี certification ผิด

ทุกกรณีที่ใบรับรองออกผิด (ไม่ว่าจะเป็น template ผิดหรือ precondition ไม่ครบ) ต้อง escalate เป็น Sev1 และ notify customer ภายใน 4 ชั่วโมง
