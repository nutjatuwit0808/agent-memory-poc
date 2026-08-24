---
layer: convention
tags: [naming, style]
created: 2026-06-20
links:
  - "[[business-logic/synthetic-iot-fleet-tracker/device-reassignment-policy]]"
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `ingestPing`, `evaluatePing` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier ทางกายภาพ

`deviceId` รูปแบบ `TRK-<6 หลัก>`, `vehicleId` รูปแบบ `VEH-<6 หลัก>` ต้องไม่ใช้ deviceId แทน vehicleId ในโค้ดแม้ตอนที่อุปกรณ์ผูกกับรถแบบ 1 ต่อ 1 ก็ตาม เพราะการผูกเปลี่ยนได้ตาม [[business-logic/synthetic-iot-fleet-tracker/device-reassignment-policy]]
