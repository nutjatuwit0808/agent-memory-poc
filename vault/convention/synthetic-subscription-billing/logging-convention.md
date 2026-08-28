---
layer: convention
tags: [logging, observability]
created: 2026-04-30
links:
  - "[[deployment/synthetic-subscription-billing/monitoring-alerts]]"
---

# Logging Convention

## correlation id

ทุก log line ที่เกี่ยวกับการเปลี่ยนแพลน เรียกเก็บเงิน หรือสร้างใบแจ้งหนี้ต้องมี `requestId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู [[deployment/synthetic-subscription-billing/monitoring-alerts]]

## ห้าม log ข้อมูลบัตรเครดิต

ห้าม log หมายเลขบัตรเครดิตหรือข้อมูลชำระเงินดิบลงใน application log เด็ดขาด แม้เพื่อ debug ก็ตาม ใช้ payment method token เท่านั้น
