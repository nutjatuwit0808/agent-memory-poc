---
layer: convention
tags: [logging, observability]
created: 2026-02-07
links:
  - "[[deployment/synthetic-event-ticketing/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับการจอง โอน หรือสแกนบัตรต้องมี `requestId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู [[deployment/synthetic-event-ticketing/monitoring-alerts]]

## ห้าม log ข้อมูลส่วนตัวผู้ซื้อ

ห้าม log ชื่อหรือข้อมูลติดต่อของผู้ซื้อลงใน application log เด็ดขาด แม้เพื่อ debug ก็ตาม ใช้ buyerId เท่านั้น
