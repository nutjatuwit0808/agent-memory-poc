---
layer: deployment
tags: [food-delivery, quickbite, environment, config, reference]
created: 2026-06-07
links:
  - "[[business-logic/synthetic-food-delivery/max-delivery-radius-policy]]"
  - "[[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy]]"
  - "[[business-logic/synthetic-food-delivery/surge-multiplier-cap-policy]]"
---

# Environment Variables Reference — QuickBite — ระบบสั่งอาหารออนไลน์

## order-router-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ORDER_ROUTER_MAX_RADIUS_KM` | `8` | ดู [[business-logic/synthetic-food-delivery/max-delivery-radius-policy]] |
| `ORDER_ROUTER_PENDING_TIMEOUT_SEC` | `90` | ดู [[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy]] |
| `ORDER_ROUTER_MAX_REQUEUE` | `3` | จำนวนครั้งสูงสุดก่อน cancel อัตโนมัติ |

## driver-dispatch-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `DISPATCH_LOCATION_INTERVAL_SEC` | `4` | ความถี่ที่คนขับส่งตำแหน่ง |
| `DISPATCH_OFFLINE_THRESHOLD_MISSED` | `6` | จำนวน update ที่ขาดก่อนถือว่า offline |
| `DISPATCH_DB_URL` | `postgres://dispatch-db.internal:5432/dispatch` | secret ห้าม log |

## eta-estimator-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ETA_REFRESH_INTERVAL_SEC` | `120` | ความถี่ refresh ETA ต่อออร์เดอร์ที่ active |
| `ETA_TRAFFIC_API_TIMEOUT_MS` | `2000` | เกินนี้ใช้ fallback estimate แทน |
| `ETA_FALLBACK_SPEED_KM_HR` | `25` | ความเร็วสมมติเมื่อ traffic data ไม่พร้อม |

## surge-pricer-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `SURGE_MAX_MULTIPLIER` | `3.0` | ดู [[business-logic/synthetic-food-delivery/surge-multiplier-cap-policy]] |
| `SURGE_ACTIVATION_RATIO` | `0.5` | อัตราส่วน driver/order ที่ trigger surge |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
