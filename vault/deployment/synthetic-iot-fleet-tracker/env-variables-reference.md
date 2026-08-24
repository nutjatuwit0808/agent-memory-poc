---
layer: deployment
tags: [iot-fleet-tracker, trackgrid, environment, config, reference]
created: 2026-07-28
links:
  - "[[business-logic/synthetic-iot-fleet-tracker/device-offline-detection-policy]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/geofence-debounce-policy]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/trip-boundary-policy]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/alert-throttling-policy]]"
---

# Environment Variables Reference — TrackGrid — ระบบติดตามฟลีทยานพาหนะ

## gps-ingest-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `INGEST_UDP_PORT` | `9100` | พอร์ตที่อุปกรณ์ยิง ping ดิบเข้ามา |
| `DEVICE_OFFLINE_AFTER_MISSED_PINGS` | `10` | ดู [[business-logic/synthetic-iot-fleet-tracker/device-offline-detection-policy]] |

## geofence-engine-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `GEOFENCE_DEBOUNCE_PINGS` | `3` | ดู [[business-logic/synthetic-iot-fleet-tracker/geofence-debounce-policy]] |
| `GEOFENCE_DB_URL` | `postgres://geofence-db.internal:5432/geofence` | secret ห้าม log |

## trip-aggregator-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `TRIP_IDLE_CLOSE_THRESHOLD_MIN` | `20` | ดู [[business-logic/synthetic-iot-fleet-tracker/trip-boundary-policy]] |
| `MILEAGE_DISCREPANCY_THRESHOLD_PCT` | `5` | เกินนี้ flag ให้คนตรวจสอบ |

## alert-dispatcher-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ALERT_THROTTLE_WINDOW_SEC` | `300` | ดู [[business-logic/synthetic-iot-fleet-tracker/alert-throttling-policy]] |
| `ALERT_PUSH_PROVIDER_KEY` | `***` | secret ห้าม log |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
