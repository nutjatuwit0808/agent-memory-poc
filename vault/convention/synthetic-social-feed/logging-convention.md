---
layer: convention
tags: [logging, observability]
created: 2025-09-28
links:
  - "[[deployment/synthetic-social-feed/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับการจัดอันดับต้องมี `requestId` เสมอ เพื่อไล่ log ข้าม service ได้ (feed-ranker → engagement-tracker) ดู [[deployment/synthetic-social-feed/monitoring-alerts]]

## ระดับ log

การ auto-remove เนื้อหา log เป็น `warning` เสมอแม้จะเป็นการทำงานปกติของระบบ เพราะทีม trust & safety ต้อง audit ย้อนหลังได้ง่าย
