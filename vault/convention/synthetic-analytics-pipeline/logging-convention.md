---
layer: convention
tags: [logging, observability]
created: 2025-09-03
links:
  - "[[deployment/synthetic-analytics-pipeline/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับการประมวลผลข้อมูลต้องมี `runId` เสมอ เพื่อไล่ log ข้าม service ได้ (ingest-connector → transform-engine → data-quality-checker → warehouse-loader) ดู [[deployment/synthetic-analytics-pipeline/monitoring-alerts]]

## ระดับ log

quality check ที่ fail ระดับ `critical` log เป็น `error` เสมอ ส่วนระดับ `warning` log เป็น `warn` แม้จะไม่บล็อกการโหลดก็ตาม เพราะทีมต้อง grep เจอง่ายตอนตรวจสอบคุณภาพข้อมูลย้อนหลัง
