---
layer: deployment
tags: [timeout, infrastructure]
created: 2026-08-07
links:
  - "[[business-logic/synthetic-ad-bidding/bid-timeout-policy]]"
---

# Bid Timeout & Connection Tuning (Infrastructure)

เอกสารนี้พูดถึง timeout ระดับ infrastructure/network เท่านั้น ไม่ใช่ business time budget ของ bid request — ดูเรื่องนั้นที่ [[business-logic/synthetic-ad-bidding/bid-timeout-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| SSP → API gateway connect | 20ms | LB config |
| API gateway → bid-request-handler | 5ms | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| bid-request-handler → fraud-filter | 15ms | env `FRAUD_CALL_TIMEOUT_MS` |
| bid-request-handler → auction-engine | 25ms | env `AUCTION_CALL_TIMEOUT_MS` |
| bid-request-handler → creative-renderer | 20ms | env `CREATIVE_CALL_TIMEOUT_MS` |

## เหตุการณ์ที่เจอจริง

เดือนมิถุนายน 2026 พบว่า network latency ระหว่าง data center สองแห่งสูงขึ้นช่วง traffic พุ่ง ทำให้ connect timeout 20ms สั้นเกินไปเป็นครั้งคราว ขยับเป็น 25ms แล้วเพิ่ม buffer ฝั่ง gateway ชดเชย
