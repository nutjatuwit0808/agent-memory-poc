---
layer: convention
tags: [logging, observability]
created: 2026-07-08
links:
  - "[[deployment/synthetic-video-streaming/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ job ต้องมี `jobId` เสมอ เพื่อไล่ log ข้าม service ได้ (transcode-worker → playlist-generator → cdn-origin-shield) ดู [[deployment/synthetic-video-streaming/monitoring-alerts]]

## ระดับ log

`failed_hard` ของ transcode log เป็น `error` เสมอแม้จะเป็นสาเหตุจากไฟล์ publisher เอง เพราะทีม on-call ต้อง grep เจอง่ายตอนไล่ incident
