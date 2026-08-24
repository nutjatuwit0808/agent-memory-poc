---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-01-27
links:
  - "[[business-logic/synthetic-travel-booking/peak-season-surge-pricing-policy]]"
---

# Scaling Policy

## Autoscaling

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| availability-search | 3 | 12 | CPU > 70% |
| booking-engine | 2 | 8 | CPU > 60% (ต่ำกว่าที่อื่นเพราะ latency-sensitive) |
| price-cache | 2 | 6 | memory > 75% |
| supplier-sync | 1 | 4 | queue depth > 200 |

## ช่วง Peak Season

ปรับ min replica ของทุก service ขึ้นล่วงหน้าตามปฏิทิน peak season ที่รู้ล่วงหน้า (ธันวาคม-มกราคม, สงกรานต์) แทนที่จะรอ autoscale ตาม threshold เพียงอย่างเดียว ดู [[business-logic/synthetic-travel-booking/peak-season-surge-pricing-policy]] สำหรับบริบทราคาที่ปรับพร้อมกัน
