---
layer: deployment
tags: [case-management, queue, runbook]
created: 2026-05-10
links:
  - "[[structure/synthetic-fraud-detection/module-case-manager]]"
  - "[[business-logic/synthetic-fraud-detection/analyst-review-sla-policy]]"
  - "[[support-cases/synthetic-fraud-detection/case-4535]]"
---

# Case Queue Management Runbook

## ภาวะปกติ

case queue depth ควรต่ำกว่า 200 cases ที่ pending review ทุกเวลา SLA dashboard แสดง real-time queue health อ้างอิง metric จาก `getQueueStats` ใน [[structure/synthetic-fraud-detection/module-case-manager]]

## เมื่อ queue ล้น

ถ้า queue depth เกิน 500 ให้ engage triage mode ตาม [[business-logic/synthetic-fraud-detection/analyst-review-sla-policy]] และเรียก reinforcement analyst จาก on-call pool ก่อน auto-adjust threshold เพราะ threshold change มีผลกว้างกว่า — ดูบทเรียนจาก [[support-cases/synthetic-fraud-detection/case-4535]]
