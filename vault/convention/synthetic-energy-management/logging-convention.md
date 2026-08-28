---
layer: convention
tags: [logging, observability]
created: 2025-09-24
links:
  - "[[deployment/synthetic-energy-management/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับ demand response หรือคำสั่งควบคุมอุปกรณ์ต้องมี `demandEventId` หรือ `scheduleId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู [[deployment/synthetic-energy-management/monitoring-alerts]]

## ห้าม log ข้อมูล meter ดิบปริมาณมาก

ห้าม log raw reading ทุกจุดข้อมูลจาก meter เพราะปริมาณสูงเกินไปและไม่มีประโยชน์ต่อ debug ให้ log เฉพาะ aggregate หรือ error case เท่านั้น
