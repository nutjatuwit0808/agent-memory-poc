---
layer: deployment
tags: [smart-building, atrium, environment, config, reference]
created: 2025-09-07
links:
  - "[[business-logic/synthetic-smart-building/hvac-setpoint-override-policy]]"
  - "[[business-logic/synthetic-smart-building/energy-optimizer-conflict-resolution-policy]]"
---

# Environment Variables Reference — Atrium — ระบบควบคุมอาคารอัจฉริยะ

## hvac-controller-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `HVAC_ZONE_DEADBAND_C` | `1.0` | ดู [[business-logic/synthetic-smart-building/hvac-setpoint-override-policy]] |
| `HVAC_STALE_SENSOR_MS` | `180000` | เวลาที่ยอมให้ sensor ไม่อัปเดตก่อนถือว่า stale |

## occupancy-sensor-hub-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `OCCUPANCY_DEBOUNCE_MS` | `8000` | กันสัญญาณ PIR สั่นทำให้ state สลับถี่เกินไป |
| `OCCUPANCY_SENSOR_DB_URL` | `postgres://occupancy-db.internal:5432/occupancy` | secret ห้าม log |

## energy-optimizer-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `OPT_INTERVAL_MS` | `300000` |  |
| `OPT_MAX_DAILY_ADJUSTMENTS` | `12` | ดู [[business-logic/synthetic-smart-building/energy-optimizer-conflict-resolution-policy]] |

## access-control-gateway-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ACCESS_BADGE_CACHE_TTL_MS` | `60000` |  |
| `ACCESS_DOOR_UNLOCK_PULSE_MS` | `5000` |  |
| `FIRE_PANEL_HARDWIRE_PORT` | `/dev/ttyFIRE0` | secret ระดับฮาร์ดแวร์ ห้าม log ค่าจริงของแต่ละอาคาร |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
