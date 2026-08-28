---
layer: convention
tags: [logging, observability]
created: 2026-04-11
links:
  - "[[deployment/synthetic-telematics/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับการคำนวณคะแนนหรือปรับเบี้ยต้องมี `tripId` หรือ `adjustmentId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู [[deployment/synthetic-telematics/monitoring-alerts]]

## ห้าม log พิกัด GPS ดิบปริมาณมาก

ห้าม log ทุกจุดพิกัด GPS เพราะปริมาณสูงเกินไปและกระทบความเป็นส่วนตัวของผู้ขับ ให้ log เฉพาะ aggregate หรือ error case เท่านั้น
