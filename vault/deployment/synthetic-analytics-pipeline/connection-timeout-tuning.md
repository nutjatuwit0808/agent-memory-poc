---
layer: deployment
tags: [timeout, infrastructure]
created: 2026-08-14
links:
  - "[[business-logic/synthetic-analytics-pipeline/late-arriving-data-policy]]"
---

# Connection & Query Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure (network/connection layer) เท่านั้น ไม่ใช่ business timeout ของข้อมูลมาช้า — ดูเรื่องนั้นที่ [[business-logic/synthetic-analytics-pipeline/late-arriving-data-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| Source connector HTTP timeout | 30s | env `EXTRACT_TIMEOUT_MS` |
| API gateway → internal service | 8s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| Warehouse write query timeout | 120s | env `LOAD_QUERY_TIMEOUT_MS` |
| Database connection pool acquire | 5s | `pg-pool` config |

## เหตุการณ์ที่เจอจริง

เดือนมิถุนายน 2026 พบว่า warehouse write query timeout สั้นเกินไปช่วง backfill ขนาดใหญ่ ทำให้ query ที่กำลังจะสำเร็จถูกตัดตอนกลางคัน ขยับ timeout จาก 60s เป็น 120s เฉพาะ backfill stream แก้ปัญหาได้
