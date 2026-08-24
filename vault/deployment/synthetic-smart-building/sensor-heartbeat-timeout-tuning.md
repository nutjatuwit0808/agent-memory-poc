---
layer: deployment
tags: [timeout, infrastructure]
created: 2026-06-30
links:
  - "[[business-logic/synthetic-smart-building/hvac-setpoint-override-policy]]"
  - "[[support-cases/synthetic-smart-building/case-1438]]"
---

# Sensor Heartbeat & Connection Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure (heartbeat/network) เท่านั้น ไม่ใช่ business rule เรื่อง stale sensor ของ HVAC — ดูเรื่องนั้นที่ [[business-logic/synthetic-smart-building/hvac-setpoint-override-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| Occupancy sensor ping interval | 10s | firmware config |
| Occupancy debounce | 8s | env `OCCUPANCY_DEBOUNCE_MS` |
| HVAC telemetry stale threshold | 180s | env `HVAC_STALE_SENSOR_MS` |
| API gateway → edge gateway | 5s | env `GATEWAY_EDGE_TIMEOUT_MS` |

## เหตุการณ์ที่เจอจริง

หลังเหตุการณ์ [[support-cases/synthetic-smart-building/case-1438]] ทีมพบว่า occupancy state ไม่มี staleness timeout เลย ต่างจาก HVAC telemetry ที่มีอยู่แล้ว เป็นช่องว่างที่กำลังแก้ไข
