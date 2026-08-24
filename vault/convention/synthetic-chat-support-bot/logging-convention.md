---
layer: convention
tags: [logging, observability]
created: 2025-10-02
links:
  - "[[deployment/synthetic-chat-support-bot/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับบทสนทนาต้องมี `conversationId` เสมอ เพื่อไล่ log ข้าม service ได้ (intent-classifier → conversation-state-manager → knowledge-base-retriever) ดู [[deployment/synthetic-chat-support-bot/monitoring-alerts]]

## ระดับ log

การส่งต่อเจ้าหน้าที่แบบ `high_risk` log เป็น `warn` เสมอแม้จะไม่ใช่ error ทางเทคนิค เพราะทีม support ต้อง grep เจอง่ายตอนตรวจสอบเคสอ่อนไหว
