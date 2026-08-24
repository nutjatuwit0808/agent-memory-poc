---
layer: deployment
tags: [timeout, infrastructure]
created: 2025-10-12
links:
  - "[[business-logic/synthetic-health-records/lab-result-critical-value-alert-policy]]"
---

# Connection Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure/connection เท่านั้น ไม่ใช่ business timeout ของการแจ้งเตือนค่าวิกฤต — ดูเรื่องนั้นที่ [[business-logic/synthetic-health-records/lab-result-critical-value-alert-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| API gateway → provider-access-control | 2s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| patient-record-store → database pool acquire | 3s | `pg-pool` config |
| lab-result-ingest → external lab webhook | 10s | env `LAB_WEBHOOK_TIMEOUT_MS` |

## เหตุผลที่ตั้งเข้มกว่าระบบทั่วไป

provider-access-control ต้อง timeout สั้นและ fail-closed (ปฏิเสธการเข้าถึงถ้าตรวจสอบไม่ทัน) ไม่ใช่ fail-open เพราะการปล่อยผ่านโดยไม่ตรวจสอบสิทธิ์ให้ทันเวลาเสี่ยงกว่าการปฏิเสธชั่วคราวมาก
