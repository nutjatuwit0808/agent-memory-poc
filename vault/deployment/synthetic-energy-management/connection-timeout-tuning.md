---
layer: deployment
tags: [timeout, infrastructure]
created: 2026-04-17
---

# Connection Timeout Tuning

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| API gateway → demand-response-controller | 2s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| meter-collector → database pool acquire | 3s | `pg-pool` config |
| MQTT broker → meter-collector | 5s | env `MQTT_INGEST_TIMEOUT_MS` |

## เหตุผลที่ demand-response-controller timeout สั้น

การตัดสินใจ load shedding ต้องเร็วเพราะ demand ที่เกิน threshold อาจนำไปสู่ไฟดับทั้ง facility ถ้าตัดสินใจช้าเกินไป — สั้นกว่า service อื่นในระบบทั้งหมด
