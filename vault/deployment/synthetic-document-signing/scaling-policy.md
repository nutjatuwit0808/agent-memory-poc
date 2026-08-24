---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-03-23
links:
  - "[[structure/synthetic-document-signing/module-reminder-scheduler]]"
  - "[[deployment/synthetic-document-signing/incident-response-runbook]]"
---

# Scaling Policy

## Autoscaling ของแต่ละ service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| envelope-builder | 2 | 8 | CPU > 70% |
| signature-capture | 2 | 10 | CPU > 60% (latency-sensitive เพราะผู้ใช้รอ interactive) |
| audit-trail-logger | 2 | 6 | write queue depth > 200 (เน้นความถูกต้องมากกว่าความเร็ว จึงไม่ scale ไวเท่า signature-capture) |

## ข้อจำกัดของ Bulk Send

bulk send ขนาดใหญ่ (หลักพัน envelope) อาจทำให้ queue ของ [[structure/synthetic-document-signing/module-reminder-scheduler]] พุ่งสูงชั่วคราว — scale service นี้ล่วงหน้าก่อนรู้ว่าจะมี bulk send ขนาดใหญ่เข้ามาดีกว่ารอ autoscaling ตอบสนอง ดู [[deployment/synthetic-document-signing/incident-response-runbook]] สำหรับกรณีที่ scale ไม่ทัน
