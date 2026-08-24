---
layer: convention
tags: [logging, observability]
created: 2025-12-13
links:
  - "[[deployment/synthetic-warehouse-robotics/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ task ต้องมี `taskId` เสมอ เพื่อไล่ log ข้าม service ได้ (task-scheduler → picking-engine → fleet-controller) ดู [[deployment/synthetic-warehouse-robotics/monitoring-alerts]]

## ระดับ log

`fault` ของหุ่นยนต์ log เป็น `error` เสมอแม้จะเป็น `warning` level ทางธุรกิจ เพราะทีม on-call ต้อง grep เจอง่ายตอน incident
