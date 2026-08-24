---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-08-06
links:
  - "[[business-logic/synthetic-video-streaming/live-event-scaling-policy]]"
---

# Scaling Policy

## Autoscaling ของ software service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| transcode-worker | 4 | 40 | queue depth > 100 segment |
| playlist-generator | 2 | 6 | CPU > 70% |
| cdn-origin-shield | 2 | 12 | request rate > 5000 rps |
| drm-license-server | 2 | 8 | CPU > 60% (เข้มกว่าที่อื่นเพราะ latency-sensitive) |

## ข้อจำกัดเชิง cost

transcode-worker ใช้ GPU instance ที่ราคาสูง scale เกินความจำเป็นกระทบต้นทุนตรงๆ — การ pre-scale ตาม [[business-logic/synthetic-video-streaming/live-event-scaling-policy]] จึงต้องแม่นยำ ไม่ scale ล่วงหน้าเผื่อเกินความจำเป็น
