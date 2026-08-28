---
layer: deployment
tags: [quality-control, qualitypulse, environment, config, reference]
created: 2025-10-21
links:
  - "[[business-logic/synthetic-quality-control/calibration-interval-policy]]"
  - "[[business-logic/synthetic-quality-control/rework-approval-authority-policy]]"
  - "[[business-logic/synthetic-quality-control/batch-rejection-threshold-policy]]"
  - "[[business-logic/synthetic-quality-control/quarantine-hold-duration-policy]]"
---

# Environment Variables Reference — QualityPulse — ระบบควบคุณภาพการผลิต

## measurement-collector-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `MEASUREMENT_CALIBRATION_GRACE_HOURS` | `4` | ดู [[business-logic/synthetic-quality-control/calibration-interval-policy]] |
| `MEASUREMENT_INGEST_RATE_LIMIT` | `200` | จำนวน measurement สูงสุดต่อวินาทีต่อ instrument |
| `MEASUREMENT_DB_URL` | `postgres://qp-measurement.internal:5432/measurements` | secret ห้าม log |

## spc-analyzer-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `SPC_MIN_POINTS_FOR_LIMIT` | `25` | จำนวนจุดขั้นต่ำก่อนคำนวณ control limit ได้ |
| `SPC_VIOLATION_PUBLISH_TOPIC` | `spc.violation_detected` | ชื่อ topic ที่ publish event เมื่อพบ violation |

## batch-inspector-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `BATCH_DUAL_INSPECTOR_LOCK_SEC` | `30` | ดู [[business-logic/synthetic-quality-control/rework-approval-authority-policy]] |
| `BATCH_MAX_REWORK_CYCLES` | `2` | เกินนี้ quarantine อัตโนมัติตาม [[business-logic/synthetic-quality-control/batch-rejection-threshold-policy]] |

## quarantine-manager-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `QUARANTINE_EXPIRY_LOOKAHEAD_HOURS` | `8` | แจ้งเตือน hold ที่จะครบกำหนดในอีกกี่ชั่วโมง |
| `QUARANTINE_DEFAULT_HOLD_HOURS` | `72` | ดู [[business-logic/synthetic-quality-control/quarantine-hold-duration-policy]] |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
