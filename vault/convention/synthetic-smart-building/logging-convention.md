---
layer: convention
tags: [logging, observability]
created: 2026-08-13
links:
  - "[[deployment/synthetic-smart-building/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ setpoint change ต้องมี `zoneId` เสมอ เพื่อไล่ log ข้าม service ได้ (energy-optimizer → hvac-controller → alert-dispatcher) ดู [[deployment/synthetic-smart-building/monitoring-alerts]]

## ระดับ log

fault ที่เกี่ยวกับ access-control หรือ fire safety log เป็น `error` เสมอแม้ business severity จะเป็น `warning` เพราะทีม on-call ต้อง grep เจอง่ายตอน incident
