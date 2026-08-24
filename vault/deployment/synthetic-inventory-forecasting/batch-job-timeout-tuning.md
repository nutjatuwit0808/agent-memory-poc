---
layer: deployment
tags: [timeout, infrastructure]
created: 2026-01-11
links:
  - "[[business-logic/synthetic-inventory-forecasting/forecast-horizon-policy]]"
  - "[[support-cases/synthetic-inventory-forecasting/case-3528]]"
---

# Batch Job Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure ของ batch job เท่านั้น ไม่ใช่ business horizon ของพยากรณ์ — ดูเรื่องนั้นที่ [[business-logic/synthetic-inventory-forecasting/forecast-horizon-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| Shard model timeout | 180s | env `MODEL_TIMEOUT_MS` |
| Shard retry สูงสุด | 2 ครั้ง | env `MAX_SHARD_RETRY` |
| Feature vector fetch timeout | 15s | `feature-store` client config |
| Batch orchestration total timeout | 4 ชั่วโมง | orchestrator config |

## เหตุการณ์ที่เจอจริง

ช่วงเทศกาลใหญ่พบว่า shard ที่มี SKU โปรโมชันซ้อนกันหนาแน่นใช้เวลาคำนวณนานกว่าปกติจนชน timeout เป็นกลุ่ม ดู [[support-cases/synthetic-inventory-forecasting/case-3528]] — อยู่ระหว่างพิจารณาปรับ timeout ให้ scale ตามความหนาแน่นของ promo แทนค่าคงที่
