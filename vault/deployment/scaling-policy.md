---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-02-12
links:
  - "[[deployment/connection-timeout-tuning]]"
  - "[[deployment/monitoring-alerts]]"
---

# Scaling Policy

## Autoscaling

แต่ละ service scale ตาม CPU utilization เฉลี่ย 5 นาที

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|---|
| order-service | 2 | 10 | CPU > 70% |
| payment-service | 2 | 8 | CPU > 60% (ต่ำกว่าที่อื่นเพราะ latency-sensitive) |
| refund-service | 1 | 4 | CPU > 70% |
| notification-service | 1 | 6 | queue depth > 500 |

## เหตุผลที่ payment-service scale ไวกว่าตัวอื่น

payment-service เชื่อมต่อ external gateway ที่มี rate limit — ถ้า pod เดียวรับ load เยอะเกินจะเจอ connection timeout ก่อน CPU จะสูงด้วยซ้ำ threshold จึงตั้งต่ำกว่าเพื่อ scale ล่วงหน้า ดูค่า timeout ที่เกี่ยวข้องที่ [[deployment/connection-timeout-tuning]]

## Alert เมื่อ scale ถึง max

ถ้า replica ชนเพดาน max ระบบจะยิง alert ทันทีตาม [[deployment/monitoring-alerts]] เพราะแปลว่ากำลังจะเริ่มมี request ตกค้าง
