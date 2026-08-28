---
layer: deployment
tags: [timeout, infrastructure]
created: 2025-09-16
---

# Connection Timeout Tuning

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| API gateway → plan-manager | 2s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| invoice-generator → database pool acquire | 3s | `pg-pool` config |
| dunning-engine → payment processor webhook | 10s | env `PAYMENT_PROCESSOR_TIMEOUT_MS` |

## เหตุผลที่ payment processor timeout นานกว่าปกติ

payment processor ภายนอกบางครั้งใช้เวลานานกว่าปกติเมื่อต้องยืนยันตัวตนเพิ่มเติม (3D Secure) — timeout สั้นเกินไปจะทำให้การเรียกเก็บเงินที่กำลังดำเนินอยู่จริงถูกตัดจบกลางคันโดยไม่จำเป็น
