---
layer: deployment
tags: [loyalty-rewards, pointsvault, environment, config, reference]
created: 2025-10-08
links:
  - "[[business-logic/synthetic-loyalty-rewards/partner-conversion-policy]]"
  - "[[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy]]"
  - "[[business-logic/synthetic-loyalty-rewards/redemption-threshold-policy]]"
  - "[[deployment/synthetic-loyalty-rewards/expiry-job-scheduling-runbook]]"
---

# Environment Variables Reference — PointsVault — ระบบสะสมแต้มและสิทธิพิเศษ

## points-ledger-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `LEDGER_DB_URL` | `postgres://ledger-db.internal:5432/ledger` | secret ห้าม log |
| `LEDGER_PENDING_CREDIT_TTL_HOURS` | `72` | ดู [[business-logic/synthetic-loyalty-rewards/partner-conversion-policy]] |
| `LEDGER_IDEMPOTENCY_TTL_DAYS` | `30` | ช่วงเวลาที่ idempotency key ยังคงป้องกัน duplicate credit ได้ |

## tier-calculator-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `TIER_EVALUATION_CRON` | `0 2 * * 0` | weekly batch re-evaluation ทุกอาทิตย์ตี 2 |
| `TIER_DOWNGRADE_GRACE_DAYS` | `90` | ดู [[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy]] |

## redemption-engine-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `REDEMPTION_LOCK_TTL_MINUTES` | `15` | ดู [[business-logic/synthetic-loyalty-rewards/redemption-threshold-policy]] |
| `REDEMPTION_MAX_DAILY_PER_ACCOUNT` | `5` | ป้องกัน abuse ดู [[business-logic/synthetic-loyalty-rewards/redemption-threshold-policy]] |

## expiry-scheduler-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `EXPIRY_BATCH_CRON` | `0 0 * * *` | รันทุกเที่ยงคืน ดู [[deployment/synthetic-loyalty-rewards/expiry-job-scheduling-runbook]] |
| `EXPIRY_BATCH_CHUNK_SIZE` | `5000` | แบ่ง account เป็น chunk เพื่อไม่ให้ DB lock นานเกิน |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
