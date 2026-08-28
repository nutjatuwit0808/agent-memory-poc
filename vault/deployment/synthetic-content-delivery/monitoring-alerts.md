---
layer: deployment
tags: [monitoring, observability]
created: 2026-07-30
links:
  - "[[support-cases/synthetic-content-delivery/case-7822]]"
---

# Monitoring & Alerts

## Alert หลัก

Certificate expire ภายใน `CERT_CRITICAL_THRESHOLD_DAYS` วัน, invalidation job ค้างสถานะ `propagating` เกิน 2x `PROPAGATION_TIMEOUT_SECONDS`, consumer lag ของ `cert.renewal_due` เกิน 1 ชั่วโมง, bandwidth usage เกิน 90% ของ quota

## ช่องทางแจ้งเตือน

Sev1 และ security incident แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมง — certificate alert ทุก severity ส่งหา on-call ทันทีเสมอ เพราะ time-sensitive มากและบทเรียนจาก [[support-cases/synthetic-content-delivery/case-7822]]
