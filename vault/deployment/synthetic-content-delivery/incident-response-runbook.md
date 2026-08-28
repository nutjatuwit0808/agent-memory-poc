---
layer: deployment
tags: [incident, runbook]
created: 2026-03-07
links:
  - "[[structure/synthetic-content-delivery/module-geo-router]]"
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = certificate expired, geo-restriction bypass, หรือ data leak ข้าม tenant — Sev2 = cache pollution, invalidation stuck กระทบ tenant หนึ่ง, edge region offline — Sev3 = latency สูงผิดปกติแต่ยัง serve ได้

## กรณี security incident

ทุกเหตุการณ์ที่เกี่ยวกับ [[structure/synthetic-content-delivery/module-geo-router]] bypass หรือ tenant data leak ต้องยกระดับเป็น Sev1 เสมอและแจ้ง security team ทันที นอกจาก on-call ปกติ เพราะอาจมีผลทางกฎหมายหรือ licensing
