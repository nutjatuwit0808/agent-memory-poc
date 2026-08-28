---
layer: deployment
tags: [telematics, drivelog, environment, config, reference]
created: 2025-11-18
links:
  - "[[business-logic/synthetic-telematics/harsh-event-sensitivity-threshold-policy]]"
  - "[[business-logic/synthetic-telematics/device-heartbeat-timeout-policy]]"
---

# Environment Variables Reference — DriveLog — ระบบ Telematics สำหรับประกันภัยรถยนต์

## trip-collector-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `TRIP_IDLE_TIMEOUT_MIN` | `5` |  |
| `GPS_TRACE_RETENTION_DAYS` | `365` |  |

## driving-scorer-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `HARSH_BRAKING_PENALTY_POINTS` | `15` | ดู [[business-logic/synthetic-telematics/harsh-event-sensitivity-threshold-policy]] |
| `SMOOTH_TRIP_BONUS_POINTS` | `5` |  |

## accident-detector-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ACCIDENT_DECELERATION_THRESHOLD_G` | `4.0` |  |
| `ACCIDENT_ALERT_CONFIRM_WINDOW_SEC` | `30` |  |

## device-provisioner-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `DEVICE_HEARTBEAT_TIMEOUT_MIN` | `60` | ดู [[business-logic/synthetic-telematics/device-heartbeat-timeout-policy]] |
| `PROVISIONING_ACTIVATION_WINDOW_DAYS` | `14` |  |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
