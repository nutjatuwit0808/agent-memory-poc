---
layer: deployment
tags: [timeout, infrastructure]
created: 2025-09-05
links:
  - "[[business-logic/synthetic-video-streaming/transcode-retry-policy]]"
---

# Transcode & Connection Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure (worker/connection) เท่านั้น ไม่ใช่ business retry ของ transcode job — ดูเรื่องนั้นที่ [[business-logic/synthetic-video-streaming/transcode-retry-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| Transcode stall timeout | 120s | env `TRANSCODE_STALL_TIMEOUT_MS` |
| API gateway → transcode-worker | 10s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| Origin shield → object storage | 15s | env `ORIGIN_FETCH_TIMEOUT_MS` |
| DRM license issuance | 3s | env `LICENSE_ISSUE_TIMEOUT_MS` |

## เหตุการณ์ที่เจอจริง

เดือนมิถุนายน 2026 พบว่า origin fetch timeout สั้นเกินไปสำหรับ segment ขนาดใหญ่ของ 4K content ทำให้ cache miss ถูกตัดก่อนโหลดเสร็จซ้ำๆ ขยับจาก 8s เป็น 15s แก้ปัญหาได้
