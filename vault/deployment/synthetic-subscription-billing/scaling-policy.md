---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-01-06
---

# Scaling Policy

## Autoscaling ของ service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| usage-meter | 4 | 16 | ingest queue depth > 800 |
| invoice-generator | 2 | 8 | latency p95 > 200ms |
| dunning-engine | 2 | 6 | retry queue depth > 300 |

## ข้อจำกัดที่ต้องระวัง

invoice-generator ต้อง scale ล่วงหน้าก่อนวันสร้างใบแจ้งหนี้ประจำเดือนที่คาดเดาได้ (ต้นเดือน) ไม่รอ autoscale ตอบสนองแบบ reactive เพราะปริมาณใบแจ้งหนี้พุ่งสูงพร้อมกันตามรอบบิลของลูกค้าจำนวนมาก
