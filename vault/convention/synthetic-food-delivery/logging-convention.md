---
layer: convention
tags: [logging, observability]
created: 2025-09-07
links:
  - "[[deployment/synthetic-food-delivery/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ order ต้องมี `orderId` เสมอ เพื่อไล่ log ข้าม service ได้ (order-router → driver-dispatch → eta-estimator → driver-payout-engine) ดู [[deployment/synthetic-food-delivery/monitoring-alerts]]

## ระดับ log

`dispatch failure` และ `payout error` log เป็น `error` เสมอ แม้จะเป็นเหตุการณ์ที่ recover ได้ เพราะทีม on-call ต้อง grep เจอง่ายตอน incident
