---
layer: convention
tags: [logging, observability]
created: 2025-11-12
links:
  - "[[deployment/synthetic-customer-segmentation/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ต้องมี `segmentId` เมื่อเกี่ยวข้องกับ segment operation เพื่อไล่ log ข้าม module ได้ (segment-builder → membership-refresher → channel-exporter) ดู [[deployment/synthetic-customer-segmentation/monitoring-alerts]]

## ระดับ log

export ไปยัง channel ทุกครั้ง log เป็น `info` เสมอพร้อม channel ID และ segment size — ห้าม log `customer_token` รายชื่อใน log เพราะ log มักถูก retain นานกว่า data retention policy
