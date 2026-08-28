---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-07-10
links:
  - "[[structure/synthetic-e-learning/module-progress-tracker]]"
---

# Scaling Policy

## Autoscaling ของ service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| progress-tracker | 2 | 8 | CPU > 70% หรือ write queue depth > 500 |
| assessment-engine | 2 | 6 | concurrent session > 200 |
| course-catalog | 2 | 4 | CPU > 60% (read-heavy, benefit จาก cache มาก) |
| certificate-issuer | 1 | 3 | queue depth > 50 |

## การรองรับ batch enrollment

เมื่อ HR push compliance training ให้พนักงานทั้งองค์กรพร้อมกัน (batch enrollment) [[structure/synthetic-e-learning/module-progress-tracker]] อาจรับ write spike ขนาดใหญ่ — ให้ pre-scale ก่อน batch enrollment ล่วงหน้า 30 นาที ไม่รอให้ autoscale kick in เพราะ ramp up ช้าเกินไป
