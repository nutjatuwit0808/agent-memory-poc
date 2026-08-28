---
layer: deployment
tags: [sensor, integration, runbook]
created: 2026-04-15
links:
  - "[[structure/synthetic-quality-control/module-measurement-collector]]"
  - "[[convention/synthetic-quality-control/calibration-record-format]]"
  - "[[convention/synthetic-quality-control/measurement-unit-convention]]"
---

# Sensor Integration Runbook

## เมื่อไหร่ต้องทำ

ทุกครั้งที่เพิ่ม instrument ใหม่หรือ replace ด้วยรุ่นต่างกัน ต้องทำตาม runbook นี้ก่อนเปิดรับข้อมูลจริง

## ขั้นตอน

1) ลงทะเบียน instrument ใน registry ของ [[structure/synthetic-quality-control/module-measurement-collector]] 2) ทำ initial calibration และบันทึกตาม [[convention/synthetic-quality-control/calibration-record-format]] 3) ทดสอบ ingest dummy measurement 5 ชุดก่อนเปิดใช้จริง 4) ยืนยัน unit conversion ถูกต้องตาม [[convention/synthetic-quality-control/measurement-unit-convention]]
