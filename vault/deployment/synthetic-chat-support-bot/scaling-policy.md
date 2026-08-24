---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-02-15
links:
  - "[[business-logic/synthetic-chat-support-bot/handoff-escalation-policy]]"
---

# Scaling Policy

## Autoscaling ของ software service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| intent-classifier | 2 | 10 | queue depth > 200 ข้อความ |
| conversation-state-manager | 2 | 8 | CPU > 70% |
| session-store | 3 | 15 | active connection > 5000 ต่อ replica |
| handoff-router | 1 | 4 | CPU > 60% |

## ข้อจำกัดเชิงบุคคล

จำนวนเจ้าหน้าที่จริงที่รับ handoff scale ไม่ได้แบบซอฟต์แวร์ — ช่วง peak support window การ scale software service เร็วขึ้นช่วยได้แค่ระดับการประมวลผล ไม่ได้เพิ่มกำลังการรับสายจริง ดู [[business-logic/synthetic-chat-support-bot/handoff-escalation-policy]] สำหรับข้อจำกัดนี้
