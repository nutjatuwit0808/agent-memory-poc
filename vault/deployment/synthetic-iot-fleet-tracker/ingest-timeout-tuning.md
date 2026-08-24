---
layer: deployment
tags: [timeout, infrastructure]
created: 2026-06-28
links:
  - "[[business-logic/synthetic-iot-fleet-tracker/trip-boundary-policy]]"
---

# Ingest & Connection Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure (network/connection layer) เท่านั้น ไม่ใช่ business timeout ของทริป — ดูเรื่องนั้นที่ [[business-logic/synthetic-iot-fleet-tracker/trip-boundary-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| UDP ingest read | 2s | `gps-ingest` config |
| API gateway → internal service | 8s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| geofence-engine → zone polygon query | 3s | env `GEOFENCE_QUERY_TIMEOUT_MS` |
| WebSocket idle timeout | 60s | `alert-dispatcher` config |

## เหตุการณ์ที่เจอจริง

เดือนกรกฎาคม 2026 พบว่า geofence query timeout สั้นเกินไปช่วง rush window ตอนมีลูกค้าใหม่ที่ตั้งโซนไว้เยอะมาก ทำให้ evaluate ตกหล่นบางส่วน ขยับ timeout จาก 2s เป็น 3s แก้ปัญหาได้
