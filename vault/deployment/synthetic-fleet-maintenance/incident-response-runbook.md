---
layer: deployment
tags: [incident, runbook]
created: 2026-05-08
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = downtime tracking ล่มหรือ stock negative ไม่สามารถ resolve ได้, Sev2 = maintenance scheduler ไม่ trigger หรือ work order ไม่สร้าง, Sev3 = report ช้าหรือ alert เกิน delay

## กรณี SLA breach

ทุกกรณีที่ vehicle downtime เกิน SLA จริงต้อง escalate เป็น Sev2 และแจ้ง Account Manager ที่รับผิดชอบลูกค้ารายนั้นภายใน 30 นาที
