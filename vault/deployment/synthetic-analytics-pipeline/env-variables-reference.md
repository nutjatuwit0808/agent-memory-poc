---
layer: deployment
tags: [analytics-pipeline, dataflow, environment, config, reference]
created: 2026-07-31
links:
  - "[[business-logic/synthetic-analytics-pipeline/extract-retry-policy]]"
  - "[[business-logic/synthetic-analytics-pipeline/dag-deadlock-policy]]"
  - "[[business-logic/synthetic-analytics-pipeline/backfill-load-policy]]"
---

# Environment Variables Reference — DataFlow — แพลตฟอร์ม ETL วิเคราะห์ข้อมูล

## ingest-connector-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `EXTRACT_TIMEOUT_MS` | `600000` | ดู [[business-logic/synthetic-analytics-pipeline/extract-retry-policy]] |
| `EXTRACT_MAX_RETRY_ATTEMPTS` | `3` |  |

## transform-engine-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `TRANSFORM_BATCH_SIZE_ROWS` | `50000` |  |
| `TRANSFORM_DB_URL` | `postgres://transform-db.internal:5432/transform` | secret ห้าม log |

## job-orchestrator-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `DAG_MAX_CONCURRENT_JOBS` | `20` | ดู [[business-logic/synthetic-analytics-pipeline/dag-deadlock-policy]] |
| `JOB_STUCK_THRESHOLD_MIN` | `45` | เกินนี้ mark job เป็น stuck |

## warehouse-loader-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `LOAD_MAX_CONCURRENT_STREAMS` | `6` | ดู [[business-logic/synthetic-analytics-pipeline/backfill-load-policy]] |
| `WAREHOUSE_CONN_STRING` | `snowflake://warehouse.internal/analytics` | secret ห้าม log |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
