---
layer: convention
tags: [logging, observability]
created: 2026-08-17
links:
  - "[[deployment/synthetic-fraud-detection/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ fraud evaluation ต้องมี `eventId` เสมอ เพื่อไล่ log ข้าม service ได้ (signal-collector → rule-engine/ml-scorer → case-manager) ดู [[deployment/synthetic-fraud-detection/monitoring-alerts]]

## ระดับ log

fraud decision log เป็น `info` เสมอ (ไม่ใช่ debug) เพราะต้องเก็บไว้เป็น audit trail decision ที่ block ผู้ใช้จริงต้องมี reason field ที่ human-readable เสมอ
