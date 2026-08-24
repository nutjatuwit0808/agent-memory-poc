---
layer: deployment
tags: [warehouse-robotics, warebot, environment, config, reference]
created: 2025-11-24
links:
  - "[[business-logic/synthetic-warehouse-robotics/pick-retry-policy]]"
  - "[[business-logic/synthetic-warehouse-robotics/task-timeout-policy]]"
  - "[[business-logic/synthetic-warehouse-robotics/peak-hour-throttling-policy]]"
  - "[[business-logic/synthetic-warehouse-robotics/charging-priority-policy]]"
---

# Environment Variables Reference — WareBot — ระบบหุ่นยนต์คลังสินค้า

## picking-engine-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PICK_ENGINE_GRIP_TIMEOUT_MS` | `1500` | เวลาสูงสุดที่รอให้แขนหุ่นยนต์รายงานผลจับ |
| `PICK_ENGINE_MAX_RETRY` | `2` | ดู [[business-logic/synthetic-warehouse-robotics/pick-retry-policy]] |

## fleet-controller-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `FLEET_HEARTBEAT_INTERVAL_MS` | `2000` |  |
| `FLEET_OFFLINE_THRESHOLD_BEATS` | `5` | จำนวน heartbeat ที่ขาดก่อนถือว่า robot offline |
| `FLEET_DB_URL` | `postgres://fleet-db.internal:5432/fleet` | secret ห้าม log |

## task-scheduler-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `TASK_STUCK_THRESHOLD_MIN` | `10` | ดู [[business-logic/synthetic-warehouse-robotics/task-timeout-policy]] |
| `TASK_QUEUE_MAX_DEPTH` | `500` | เกินนี้ throttle ตาม [[business-logic/synthetic-warehouse-robotics/peak-hour-throttling-policy]] |

## charging-station-manager-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `CHARGING_STATION_COUNT` | `24` | จำนวนหัวชาร์จทั้งหมดในคลัง |
| `CHARGING_RESERVE_SLOT_COUNT` | `3` | กันไว้สำหรับหุ่นยนต์ฉุกเฉิน ดู [[business-logic/synthetic-warehouse-robotics/charging-priority-policy]] |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
