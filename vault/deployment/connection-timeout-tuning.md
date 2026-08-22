---
layer: deployment
tags: [timeout, infrastructure, tuning]
created: 2026-03-10
links:
  - "[[structure/module-payment]]"
  - "[[deployment/scaling-policy]]"
---

# Connection Timeout Tuning

เอกสารนี้พูดถึง **timeout ระดับ infrastructure** เท่านั้น (network/connection layer) ไม่ใช่ business timeout ของ refund — ดูเรื่องนั้นที่ [[business-logic/refund-timeout-policy]] แทน

## ค่า timeout ปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| Nginx upstream connect | 5s | `nginx.conf` |
| Nginx upstream read | 30s | `nginx.conf` |
| API gateway → internal service | 10s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| payment-service → payment gateway | 30s | env `PAYMENT_GATEWAY_TIMEOUT_MS` |
| Database connection pool acquire | 5s | `pg-pool` config |

## หลักการตั้งค่า

timeout ของ layer นอกต้อง **มากกว่า** timeout ของ layer ในเสมอ ไม่งั้น caller จะ timeout ก่อนที่ callee จะทันรายงานผลลัพธ์ กลายเป็นเสียเวลา retry ซ้ำทั้งที่ operation จริงสำเร็จไปแล้ว

## เหตุการณ์ที่เจอจริง

เดือนกุมภาพันธ์ 2026 nginx upstream read timeout 30s ตรงกับ payment gateway timeout พอดี ทำให้บาง request ถูกตัดตอนก่อน payment-service จะได้ error กลับมาเอง แก้โดยขยับ nginx เป็น 35s ให้มี buffer ดู [[deployment/scaling-policy]] สำหรับบริบทการปรับ infra อื่นๆ ที่ทำพร้อมกัน
