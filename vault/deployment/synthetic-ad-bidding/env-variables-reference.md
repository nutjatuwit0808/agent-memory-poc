---
layer: deployment
tags: [ad-bidding, adpulse, environment, config, reference]
created: 2025-11-02
links:
  - "[[business-logic/synthetic-ad-bidding/bid-timeout-policy]]"
  - "[[business-logic/synthetic-ad-bidding/budget-pacing-policy]]"
  - "[[business-logic/synthetic-ad-bidding/fraud-score-threshold-policy]]"
---

# Environment Variables Reference — AdPulse — แพลตฟอร์มประมูลโฆษณาแบบเรียลไทม์ (RTB)

## bid-request-handler-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `BID_REQUEST_TIMEOUT_MS` | `80` | ดู [[business-logic/synthetic-ad-bidding/bid-timeout-policy]] |
| `DOWNSTREAM_CALL_BUDGET_MS` | `60` | งบเวลารวมสำหรับ downstream call ทั้งหมด |

## auction-engine-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `AUCTION_MIN_BID_INCREMENT` | `0.01` | หน่วยขั้นต่ำของราคาที่ปรับได้ |
| `AUCTION_DB_URL` | `postgres://auction-db.internal:5432/auction` | secret ห้าม log |

## budget-pacer-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PACING_SYNC_INTERVAL_MS` | `1000` | ดู [[business-logic/synthetic-ad-bidding/budget-pacing-policy]] |
| `PACING_OVERSPEND_TOLERANCE_PCT` | `2` | เกินนี้ถือเป็นบั๊กที่ต้อง investigate |

## fraud-filter-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `FRAUD_SCORE_BLOCK_THRESHOLD` | `80` | ดู [[business-logic/synthetic-ad-bidding/fraud-score-threshold-policy]] |
| `FRAUD_RULE_REFRESH_INTERVAL_MS` | `300000` | ความถี่ที่ดึง rule ชุดใหม่จาก rule store |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
