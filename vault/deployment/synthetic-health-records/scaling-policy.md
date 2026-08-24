---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-08-19
---

# Scaling Policy

## Autoscaling ของ service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| provider-access-control | 3 | 10 | latency p95 > 100ms (fail-closed sensitive) |
| lab-result-ingest | 2 | 8 | queue depth > 500 |
| audit-log-service | 2 | 6 | write latency > 50ms |

## ข้อจำกัดที่ต้องระวัง

provider-access-control ต้อง scale ล่วงหน้าก่อน peak (เช่น ต้นชั่วโมงคลินิกเปิด) ไม่รอ autoscale ตามหลัง เพราะ fail-closed design ทำให้ latency สูงแปลว่าผู้ป่วยเข้าไม่ถึงบริการ ไม่ใช่แค่ช้า
