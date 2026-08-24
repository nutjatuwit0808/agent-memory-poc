---
layer: deployment
tags: [timeout, infrastructure]
created: 2026-01-09
links:
  - "[[business-logic/synthetic-document-signing/reminder-frequency-policy]]"
  - "[[support-cases/synthetic-document-signing/case-6387]]"
---

# Notary Webhook Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure ของการเชื่อมต่อ notary provider เท่านั้น ไม่ใช่ business timeout ของการรอผู้เซ็น — ดูเรื่องนั้นที่ [[business-logic/synthetic-document-signing/reminder-frequency-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| Notary session request timeout | 10s | env `NOTARY_SESSION_TIMEOUT_MS` (600000ms รวม session ทั้งหมด) |
| Webhook processing timeout | 5s | `notary-integration` service config |
| API gateway → envelope-builder | 8s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| Database connection pool acquire | 5s | `pg-pool` config |

## เหตุการณ์ที่เจอจริง

พบว่า provider บางรายส่ง webhook ซ้ำเมื่อไม่ได้รับ acknowledgment ทันเวลาที่เขากำหนด (5 วินาที) ทั้งที่ฝั่งเราประมวลผลสำเร็จแล้วแค่ตอบช้า ดู [[support-cases/synthetic-document-signing/case-6387]] — แก้โดยตอบ ack ทันทีที่รับ payload ก่อนแล้วค่อยประมวลผล async
