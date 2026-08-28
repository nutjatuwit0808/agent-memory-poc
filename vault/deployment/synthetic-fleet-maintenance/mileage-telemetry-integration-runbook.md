---
layer: deployment
tags: [telemetry, odometer, runbook]
created: 2026-01-02
links:
  - "[[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]]"
---

# Mileage Telemetry Integration Runbook

## เมื่อไหร่ต้องทำ

ทุกครั้งที่เพิ่มยานพาหนะใหม่หรือเปลี่ยน OBD device ที่ส่ง odometer เข้าระบบ ต้องทำ calibration run ก่อนเปิดใช้จริง

## ขั้นตอน

1) ลงทะเบียน vehicle ใน registry ของ [[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]] 2) ทดสอบส่ง odometer dummy ที่ค่า plausible 3 ชุดก่อนเปิดใช้จริง 3) ตั้งค่า initial odometer ให้ตรงกับมาตรวัดจริงบนรถ 4) ยืนยัน maintenance trigger คำนวณถูกต้อง
