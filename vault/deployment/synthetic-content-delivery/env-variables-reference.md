---
layer: deployment
tags: [content-delivery, edgeserve, environment, config, reference]
created: 2026-01-06
links:
  - "[[business-logic/synthetic-content-delivery/cache-ttl-policy]]"
  - "[[business-logic/synthetic-content-delivery/origin-retry-policy]]"
  - "[[business-logic/synthetic-content-delivery/invalidation-propagation-policy]]"
  - "[[business-logic/synthetic-content-delivery/certificate-renewal-policy]]"
---

# Environment Variables Reference — EdgeServe — ระบบกระจายเนื้อหา (CDN)

## cache-coordinator-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `CACHE_DEFAULT_TTL_SECONDS` | `3600` | ดู [[business-logic/synthetic-content-delivery/cache-ttl-policy]] สำหรับ TTL ตาม content type |
| `CACHE_STALE_REVALIDATE_WINDOW_SECONDS` | `300` | ระยะเวลา stale-while-revalidate ที่ยอมให้เสิร์ฟเนื้อหาเก่าขณะ revalidate |
| `CACHE_DB_URL` | `postgres://cache-db.internal:5432/edgeserve` | secret ห้าม log |

## origin-puller-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ORIGIN_PULL_TIMEOUT_MS` | `5000` | เวลาสูงสุดที่รอ origin ตอบสนอง |
| `ORIGIN_MAX_RETRY` | `3` | ดู [[business-logic/synthetic-content-delivery/origin-retry-policy]] |
| `ORIGIN_CIRCUIT_BREAKER_THRESHOLD` | `5` | จำนวนความล้มเหลวก่อนเปิด circuit breaker |

## invalidation-dispatcher-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `INVALIDATION_PROPAGATION_TIMEOUT_SECONDS` | `30` | ดู [[business-logic/synthetic-content-delivery/invalidation-propagation-policy]] |
| `INVALIDATION_MAX_RETRY` | `3` | จำนวนครั้ง retry สำหรับ edge node ที่ไม่ตอบสนอง |

## certificate-manager-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `CERT_RENEWAL_LEAD_TIME_DAYS` | `30` | ดู [[business-logic/synthetic-content-delivery/certificate-renewal-policy]] |
| `CERT_CRITICAL_THRESHOLD_DAYS` | `7` | เมื่อเหลือน้อยกว่านี้จะ alert ด่วนทันที |
| `ACME_DIRECTORY_URL` | `https://acme.internal/directory` | URL ของ ACME CA ที่ใช้ |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
