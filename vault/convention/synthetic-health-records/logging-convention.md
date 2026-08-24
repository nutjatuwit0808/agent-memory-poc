---
layer: convention
tags: [logging, observability]
created: 2025-09-23
links:
  - "[[deployment/synthetic-health-records/monitoring-alerts]]"
  - "[[convention/synthetic-health-records/phi-handling-convention]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับการเข้าถึงข้อมูลผู้ป่วยต้องมี `requestId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู [[deployment/synthetic-health-records/monitoring-alerts]]

## ห้าม log ข้อมูลผู้ป่วยตรงๆ

ห้าม log ชื่อ, วันเกิด, หรือรายละเอียดการวินิจฉัยลงใน application log เด็ดขาด แม้เพื่อ debug ก็ตาม ใช้ patientId เท่านั้น ดู [[convention/synthetic-health-records/phi-handling-convention]]
