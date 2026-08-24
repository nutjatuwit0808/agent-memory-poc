---
layer: deployment
tags: [travel-booking, tripledger, environment, config, reference]
created: 2026-02-14
links:
  - "[[business-logic/synthetic-travel-booking/booking-hold-atomicity-policy]]"
  - "[[business-logic/synthetic-travel-booking/price-cache-staleness-policy]]"
---

# Environment Variables Reference — TripLedger — ระบบจองที่พักและการเดินทาง

## availability-search-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `SEARCH_TIMEOUT_MS` | `3000` | เวลาสูงสุดที่รอผลจากซัพพลายเออร์ก่อนตัดออกจากรอบค้นหา |
| `MAX_SUPPLIERS_PER_QUERY` | `12` | จำนวนซัพพลายเออร์สูงสุดที่ fan-out ต่อ 1 query |

## booking-engine-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `BOOKING_HOLD_TTL_SEC` | `600` | ดู [[business-logic/synthetic-travel-booking/booking-hold-atomicity-policy]] |
| `BOOKING_DB_URL` | `postgres://booking-db.internal:5432/booking` | secret ห้าม log |

## price-cache-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PRICE_CACHE_TTL_SEC` | `300` | อายุปกติของราคาที่ cache ไว้ก่อนถือว่า stale |
| `PRICE_CACHE_STALE_GRACE_SEC` | `120` | ช่วงผ่อนผันหลังหมดอายุ ดู [[business-logic/synthetic-travel-booking/price-cache-staleness-policy]] |

## supplier-sync-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `SUPPLIER_SYNC_INTERVAL_SEC` | `90` | ความถี่ poll สำหรับซัพพลายเออร์ที่ไม่มี webhook |
| `SUPPLIER_SYNC_RETRY_MAX` | `3` | จำนวนครั้งที่ retry ก่อน mark degraded |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
