---
layer: deployment
tags: [calibration, monitoring]
created: 2025-11-08
links:
  - "[[business-logic/synthetic-quality-control/calibration-interval-policy]]"
---

# Calibration Alert Setup

เอกสารนี้อธิบายการตั้ง alert สำหรับ calibration due ของ instrument ทุกตัว ซึ่งเป็น critical path ของ [[business-logic/synthetic-quality-control/calibration-interval-policy]]

## Alert ที่ต้องมี

1) Instrument due ใน 7 วัน (warning) 2) Instrument due ใน 2 วัน (urgent) 3) Instrument เกิน grace period (critical — ระงับอัตโนมัติ) 4) Calibration check job ไม่ run ภายใน 2 ชั่วโมง (dead-man alert)

## ช่องทางแจ้งเตือน

critical ไปที่ on-call QC ทันที warning/urgent รวมเป็น daily digest ให้ QC team ทุก 08:00
