---
layer: convention
tags: [logging, observability]
created: 2025-10-18
links:
  - "[[deployment/synthetic-content-delivery/monitoring-alerts]]"
  - "[[support-cases/synthetic-content-delivery/case-7822]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ invalidation ต้องมี `jobId` เสมอ เพื่อไล่ log ข้าม service ได้ (invalidation-dispatcher → cache-coordinator → edge node acknowledgment) ดู [[deployment/synthetic-content-delivery/monitoring-alerts]]

## ระดับ log

Certificate renewal failure ให้ log เป็น `error` เสมอแม้ยังอยู่ใน lead time — เพราะทีม on-call ต้อง grep เจอง่ายก่อนที่สถานการณ์จะวิกฤต บทเรียนจาก [[support-cases/synthetic-content-delivery/case-7822]]
