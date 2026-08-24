---
layer: deployment
tags: [timeout, infrastructure]
created: 2026-01-29
links:
  - "[[business-logic/synthetic-marketing-automation/unsubscribe-honor-policy]]"
---

# Send Latency & Connection Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure (การเชื่อมต่อ ESP) เท่านั้น ไม่ใช่ business timeout ของ SLA unsubscribe — ดูเรื่องนั้นที่ [[business-logic/synthetic-marketing-automation/unsubscribe-honor-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| ESP API connect | 5s | env `ESP_CONNECT_TIMEOUT_MS` |
| ESP API read (ต่อ batch) | 20s | env `ESP_READ_TIMEOUT_MS` |
| API gateway → campaign-builder | 10s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| Consent check per batch | 3s | env `CONSENT_CHECK_TIMEOUT_MS` |

## เหตุการณ์ที่เจอจริง

เดือนมิถุนายน 2026 พบว่า ESP read timeout สั้นเกินไปช่วงที่ ESP มี latency สูงตอน peak ทำให้ batch ถูกตัดตอนก่อน ESP จะตอบสำเร็จจริง เกิดการ retry ซ้ำโดยไม่จำเป็น ขยับ timeout จาก 12s เป็น 20s แก้ปัญหาได้
