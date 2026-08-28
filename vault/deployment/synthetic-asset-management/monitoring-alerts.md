---
layer: deployment
tags: [monitoring, observability]
created: 2025-11-01
---

# Monitoring & Alerts

## Alert หลัก

license pool utilization เกิน `LICENSE_WARNING_THRESHOLD_PCT`, sync job ล้มเหลวเกิน 2 รอบติดต่อกัน, disposal request ค้างเกิน 30 วันโดยไม่มีความเคลื่อนไหว, depreciation schedule ที่ไม่สามารถสร้างได้เมื่อ asset ใหม่เข้าระบบ

## ช่องทางแจ้งเตือน

Sev1 แจ้ง on-call และ compliance officer ทันที ส่วน Sev2/3 รวมเป็น digest รายชั่วโมง
