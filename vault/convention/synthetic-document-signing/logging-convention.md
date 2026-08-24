---
layer: convention
tags: [logging, observability]
created: 2026-04-21
links:
  - "[[deployment/synthetic-document-signing/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ envelope ต้องมี `envelopeId` เสมอ เพื่อไล่ log ข้าม service ได้ (envelope-builder → signature-capture → audit-trail-logger) ดู [[deployment/synthetic-document-signing/monitoring-alerts]]

## ระดับ log

ความล้มเหลวของ `verifyChainIntegrity` log เป็น `error` เสมอไม่ว่าสาเหตุจะเป็นอะไร เพราะกระทบความน่าเชื่อถือทางกฎหมายโดยตรง ทีม on-call ต้อง grep เจอทันที
