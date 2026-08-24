---
layer: convention
tags: [logging, observability]
created: 2026-04-04
links:
  - "[[deployment/synthetic-ad-bidding/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ bid request ต้องมี `requestId` เสมอเพื่อไล่ log ข้าม service ได้ (bid-request-handler → fraud-filter → auction-engine → creative-renderer) ดู [[deployment/synthetic-ad-bidding/monitoring-alerts]]

## ระดับ log

fraud score ที่เกิน threshold log เป็น `warn` เสมอแม้จะไม่ได้ block จริง (เช่นกรณี bid shading) เพื่อให้ทีม trust & safety สืบย้อนแนวโน้มได้ ส่วนกรณี block จริง log เป็น `error`
