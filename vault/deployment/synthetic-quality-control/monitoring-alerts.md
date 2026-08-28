---
layer: deployment
tags: [monitoring, observability]
created: 2025-12-11
---

# Monitoring & Alerts

## Alert หลัก

SPC violation rate เกิน 20% ของ batch ใน 1 ชั่วโมง, quarantine hold ที่ batch ผ่าน rework แล้วแต่ยังไม่ release เกิน 24 ชั่วโมง, certification generator error rate เกิน 1% ใน 10 นาที

## ช่องทาง

Sev1/Sev2 แจ้ง on-call QC และ Engineering ทันทีทาง pager Sev3 รวม digest รายชั่วโมง
