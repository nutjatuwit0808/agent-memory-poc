---
layer: deployment
tags: [customer-segmentation, segmentiq, environment, config, reference]
created: 2026-05-05
links:
  - "[[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]]"
  - "[[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]]"
  - "[[business-logic/synthetic-customer-segmentation/health-score-threshold-policy]]"
---

# Environment Variables Reference — SegmentIQ — แพลตฟอร์ม Customer Segmentation

## event-ingester-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `INGEST_DEDUP_WINDOW_HOURS` | `24` | ช่วงเวลาที่ fingerprint เดิมถือว่า duplicate |
| `INGEST_MAX_PAYLOAD_BYTES` | `65536` | ขนาด payload สูงสุดที่รับได้ต่อ event |
| `INGEST_DB_URL` | `postgres://event-db.internal:5432/events` | secret ห้าม log |

## membership-refresher-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `REFRESH_CRON_SCHEDULE` | `0 2 * * *` | ช่วงที่ full refresh รายวันรัน ดู [[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]] |
| `REFRESH_SINGLE_TIMEOUT_MS` | `300000` | timeout ต่อ segment เดียว |
| `REFRESH_MAX_CONCURRENT_JOBS` | `1` | ป้องกัน concurrent run ดู [[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]] |

## channel-exporter-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `EXPORT_FRESHNESS_MAX_AGE_HOURS` | `26` | membership เก่ากว่านี้จะ refuse export ดู [[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]] |
| `EXPORT_MAX_RETRY_COUNT` | `3` | ดู [[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]] |

## health-monitor-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `HEALTH_DEGRADED_THRESHOLD` | `60` | score ต่ำกว่านี้ถือว่า degraded ดู [[business-logic/synthetic-customer-segmentation/health-score-threshold-policy]] |
| `HEALTH_CRITICAL_THRESHOLD` | `30` | score ต่ำกว่านี้ escalate ทันที |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
