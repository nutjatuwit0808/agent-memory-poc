---
layer: deployment
tags: [health-records, vitalchart, environment, config, reference]
created: 2026-02-11
links:
  - "[[business-logic/synthetic-health-records/audit-log-retention-policy]]"
  - "[[business-logic/synthetic-health-records/prescription-refill-limit-policy]]"
  - "[[business-logic/synthetic-health-records/lab-result-critical-value-alert-policy]]"
---

# Environment Variables Reference — VitalChart — ระบบจัดการเวชระเบียนผู้ป่วย

## patient-record-store-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `RECORD_VERSION_RETENTION_YEARS` | `10` | ดู [[business-logic/synthetic-health-records/audit-log-retention-policy]] |
| `RECORD_DB_URL` | `postgres://record-db.internal:5432/records` | secret ห้าม log |

## prescription-manager-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `MAX_REFILL_COUNT_PER_PRESCRIPTION` | `5` |  |
| `REFILL_MIN_INTERVAL_DAYS` | `21` | ดู [[business-logic/synthetic-health-records/prescription-refill-limit-policy]] |

## lab-result-ingest-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PATIENT_MATCH_CONFIDENCE_THRESHOLD` | `0.98` | ต่ำกว่านี้ต้องตรวจด้วยมือเสมอ |
| `CRITICAL_VALUE_ALERT_TIMEOUT_MIN` | `15` | ดู [[business-logic/synthetic-health-records/lab-result-critical-value-alert-policy]] |

## provider-access-control-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ACCESS_CACHE_TTL_SECONDS` | `60` |  |
| `BREAK_GLASS_ALERT_WEBHOOK` | `https://alerts.internal/break-glass` | secret ห้าม log |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
