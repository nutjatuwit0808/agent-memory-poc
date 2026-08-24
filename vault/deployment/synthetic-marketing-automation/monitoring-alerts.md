---
layer: deployment
tags: [monitoring, observability]
created: 2025-11-29
---

# Monitoring & Alerts

## Alert หลัก

bounce rate เกิน `BOUNCE_RATE_PAUSE_THRESHOLD_PCT`, send job ค้างสถานะ `sending` เกิน 2 เท่าของเวลาที่ประมาณไว้, consent check latency เกิน `CONSENT_CHECK_TIMEOUT_MS`

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้ถึงเช้า
