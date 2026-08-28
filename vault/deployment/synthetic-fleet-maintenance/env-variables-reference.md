---
layer: deployment
tags: [fleet-maintenance, wrenchhub, environment, config, reference]
created: 2025-09-05
links:
  - "[[business-logic/synthetic-fleet-maintenance/preventive-maintenance-interval-policy]]"
  - "[[support-cases/synthetic-fleet-maintenance/case-2072]]"
  - "[[business-logic/synthetic-fleet-maintenance/work-order-priority-escalation-policy]]"
  - "[[business-logic/synthetic-fleet-maintenance/downtime-sla-threshold-policy]]"
---

# Environment Variables Reference — WrenchHub — ระบบบำรุงรักษาฝูงรถขนส่ง

## maintenance-scheduler-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `SCHEDULER_DUE_LOOKAHEAD_DAYS` | `7` | ดู [[business-logic/synthetic-fleet-maintenance/preventive-maintenance-interval-policy]] |
| `SCHEDULER_ODOMETER_MAX_JUMP_KM` | `1000` | odometer ที่กระโดดเกินนี้ถือว่า invalid ดู [[support-cases/synthetic-fleet-maintenance/case-2072]] |
| `SCHEDULER_DB_URL` | `postgres://wrench-scheduler.internal:5432/schedules` | secret ห้าม log |

## work-order-manager-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `WO_ESCALATION_THRESHOLD_HOURS` | `24` | ดู [[business-logic/synthetic-fleet-maintenance/work-order-priority-escalation-policy]] |
| `WO_PARTS_RECONCILIATION_WINDOW_MIN` | `15` | window ที่ยอมให้ parts deduction มาถึงช้าก่อน flag discrepancy |

## parts-inventory-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PARTS_RESERVATION_EXPIRY_HOURS` | `48` | reservation ที่ยังไม่ถูก consume จะหมดอายุและ return สต็อก |
| `PARTS_OPTIMISTIC_LOCK_RETRY` | `3` | จำนวนครั้งที่ retry deduction เมื่อเจอ concurrent conflict |
| `PARTS_DB_URL` | `postgres://wrench-parts.internal:5432/inventory` | secret ห้าม log |

## downtime-tracker-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `DOWNTIME_SLA_WARNING_PCT` | `80` | แจ้งเตือนเมื่อ downtime ถึง % ของ SLA limit ดู [[business-logic/synthetic-fleet-maintenance/downtime-sla-threshold-policy]] |
| `DOWNTIME_MAX_BACKDATE_HOURS` | `4` | บันทึก startedAt ย้อนหลังได้สูงสุดกี่ชั่วโมง เพื่อกัน abuse |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
