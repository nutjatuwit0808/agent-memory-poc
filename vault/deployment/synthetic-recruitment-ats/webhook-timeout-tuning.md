---
layer: deployment
tags: [timeout, infrastructure]
created: 2025-12-03
links:
  - "[[business-logic/synthetic-recruitment-ats/background-check-sla-policy]]"
  - "[[support-cases/synthetic-recruitment-ats/case-3202]]"
---

# Webhook & Connection Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure (network/webhook) เท่านั้น ไม่ใช่ business SLA ของ background check — ดูเรื่องนั้นที่ [[business-logic/synthetic-recruitment-ats/background-check-sla-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| API gateway → internal service | 8s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| Vendor webhook receive | 10s | webhook endpoint config |
| Calendar API call | 15s | env `SCHEDULER_CALENDAR_TIMEOUT_MS` |
| Database connection pool acquire | 5s | `pg-pool` config |

## เหตุการณ์ที่เจอจริง

เหตุการณ์ [[support-cases/synthetic-recruitment-ats/case-3202]] พบว่า webhook endpoint ที่ deploy ระหว่างช่วงที่ vendor กำลัง retry ทำให้ผลตรวจสอบหายไปเลยเพราะ retry ของ vendor หมดจำนวนครั้งก่อน deploy จะเสร็จ เป็นเหตุผลที่ต้องย้ายไป zero-downtime deploy
