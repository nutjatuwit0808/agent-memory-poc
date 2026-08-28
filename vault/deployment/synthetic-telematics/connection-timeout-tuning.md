---
layer: deployment
tags: [timeout, infrastructure]
created: 2025-09-07
---

# Connection Timeout Tuning

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| API gateway → driving-scorer | 2s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| trip-collector → database pool acquire | 2s | `pg-pool` config |
| อุปกรณ์ OBD-II → trip-collector | 8s | env `DEVICE_INGEST_TIMEOUT_MS` |

## เหตุผลที่ device ingest timeout นานกว่าปกติ

อุปกรณ์ OBD-II เชื่อมต่อผ่านเครือข่ายมือถือที่มี latency สูงกว่าปกติในบางพื้นที่ timeout สั้นเกินไปจะทำให้ข้อมูลที่ส่งมาจริงถูกตัดทิ้งโดยไม่จำเป็นบ่อยเกินไป
