---
layer: deployment
tags: [timeout, infrastructure]
created: 2026-07-10
links:
  - "[[business-logic/synthetic-warehouse-robotics/task-timeout-policy]]"
---

# Heartbeat & Connection Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure (heartbeat/network) เท่านั้น ไม่ใช่ business timeout ของ pick task — ดูเรื่องนั้นที่ [[business-logic/synthetic-warehouse-robotics/task-timeout-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| Robot heartbeat interval | 2s | env `FLEET_HEARTBEAT_INTERVAL_MS` |
| Offline threshold | 5 missed beats (~10s) | env `FLEET_OFFLINE_THRESHOLD_BEATS` |
| Fleet-controller → robot command ack | 500ms | firmware config |
| API gateway → task-scheduler | 3s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |

## เหตุการณ์ที่เจอจริง

เดือนพฤษภาคม 2026 พบว่า offline threshold สั้นเกินไปช่วง WiFi congestion สูงตอน peak window ทำให้หุ่นยนต์ถูก mark offline ทั้งที่ยังทำงานปกติ ขยับ threshold จาก 3 เป็น 5 beats แก้ปัญหาได้
