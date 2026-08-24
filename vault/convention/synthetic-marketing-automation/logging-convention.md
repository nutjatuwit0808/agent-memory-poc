---
layer: convention
tags: [logging, observability]
created: 2026-04-12
links:
  - "[[deployment/synthetic-marketing-automation/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ send job ต้องมี `jobId` เสมอ เพื่อไล่ log ข้าม service ได้ (send-scheduler → template-renderer → consent-manager) ดู [[deployment/synthetic-marketing-automation/monitoring-alerts]]

## ระดับ log

การปฏิเสธส่งเพราะ consent status เป็น `opted_out` ต้อง log เป็น `info` เสมอไม่ใช่ `error` เพราะเป็นพฤติกรรมที่ถูกต้องตามออกแบบ ต่างจาก webhook ที่ parse ไม่ได้ซึ่งต้อง log เป็น `error`
