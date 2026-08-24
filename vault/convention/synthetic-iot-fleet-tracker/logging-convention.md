---
layer: convention
tags: [logging, observability]
created: 2026-03-19
links:
  - "[[deployment/synthetic-iot-fleet-tracker/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ ping ต้องมี `deviceId` และ `pingId` เสมอ เพื่อไล่ log ข้าม service ได้ (gps-ingest → geofence-engine → trip-aggregator) ดู [[deployment/synthetic-iot-fleet-tracker/monitoring-alerts]]

## ระดับ log

อุปกรณ์ที่ถูก mark `offline` log เป็น `warn` เสมอ ส่วน `device.offline` ที่ตามมาด้วย reactivation ภายใน 1 นาที (สงสัยว่าเป็น GPS noise ไม่ใช่ offline จริง) log แยกเป็น `info` เพื่อไม่ให้ log วิกฤตจริงถูกกลบ
