---
layer: convention
tags: [logging, observability]
created: 2026-04-27
links:
  - "[[deployment/synthetic-quality-control/monitoring-alerts]]"
---

# Logging Convention

## Correlation ID

ทุก log line ที่เกี่ยวกับ batch ต้องมี `batch_id` เสมอ เพื่อไล่ log ข้าม service ได้ (batch-inspector → spc-analyzer → quarantine-manager) ดู [[deployment/synthetic-quality-control/monitoring-alerts]]

## ระดับ log

`certification.issued` และ `hold.released` ต้อง log เป็น `info` เสมอ เพราะเป็น audit event สำคัญที่ต้องอ่านย้อนหลังได้ง่าย ห้าม log เป็น `debug` แม้อยู่ใน dev mode
