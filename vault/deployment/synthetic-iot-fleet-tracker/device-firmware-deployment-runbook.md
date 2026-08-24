---
layer: deployment
tags: [firmware, runbook]
created: 2026-05-04
links:
  - "[[business-logic/synthetic-iot-fleet-tracker/device-firmware-rollout-policy]]"
  - "[[convention/synthetic-iot-fleet-tracker/testing-convention]]"
---

# Device Firmware Deployment Runbook

ขั้นตอนละเอียดสำหรับ rollout firmware ตามที่กำหนดไว้ใน [[business-logic/synthetic-iot-fleet-tracker/device-firmware-rollout-policy]]

## ก่อน rollout

ต้องผ่าน replay test ครบตาม [[convention/synthetic-iot-fleet-tracker/testing-convention]] และเลือกอุปกรณ์กลุ่มแรกจากรุ่นฮาร์ดแวร์ที่มีพื้นที่ flash เพียงพอเท่านั้น

## ระหว่างเฝ้าระวัง 48 ชั่วโมง

เฝ้าดู ping success rate, battery consumption, และจำนวนอุปกรณ์ที่หายไปหลังอัปเดตเทียบกับกลุ่มที่ยังไม่อัปเดต ถ้าตัวเลขต่างกันเกิน 3% ให้หยุดขยาย rollout ทันที
