---
layer: convention
tags: [logging, observability]
created: 2026-04-05
links:
  - "[[deployment/synthetic-legal-contracts/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับกระบวนการอนุมัติหรือเซ็นต้องมี `requestId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู [[deployment/synthetic-legal-contracts/monitoring-alerts]]

## ห้าม log เนื้อหาสัญญาที่เป็นความลับ

ห้าม log เนื้อหา clause หรือรายละเอียดคู่สัญญาที่มีเงื่อนไขรักษาความลับลงใน application log เด็ดขาด แม้เพื่อ debug ก็ตาม ใช้ contractId เท่านั้น
