---
layer: business-logic
tags: [ingest, offline, policy]
created: 2026-08-10
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-gps-ingest]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/device-offline-detection-policy-edge-cases]]"
---

# นโยบายตรวจจับอุปกรณ์ Offline

เมื่อ [[structure/synthetic-iot-fleet-tracker/module-gps-ingest]] ไม่ได้รับ ping จากอุปกรณ์ใดเกิน `DEVICE_OFFLINE_AFTER_MISSED_PINGS` รอบติดต่อกัน (คำนวณจากช่วงเวลาที่อุปกรณ์รุ่นนั้นควรส่ง ping ตามปกติ) จะถูก mark เป็น `offline` อัตโนมัติและ publish event `device.offline`

อุปกรณ์แต่ละรุ่นมีช่วงเวลาส่ง ping ไม่เท่ากัน (บางรุ่นทุก 10 วินาที บางรุ่นทุก 30 วินาที) threshold จึงคำนวณเป็นสัดส่วนของ interval ที่ตั้งไว้ต่ออุปกรณ์ ไม่ใช่ตัวเลขวินาทีคงที่ตัวเดียวทั้งระบบ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-iot-fleet-tracker/device-offline-detection-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
