---
layer: deployment
tags: [monitoring, observability]
created: 2026-04-27
---

# Monitoring & Alerts

## Alert หลัก

background check ค้าง `pending` เกิน 2 เท่าของ SLA, calendar sync ล้มเหลวติดต่อกันเกิน 2 รอบ, offer อยู่ใน `pending_approval` เกิน `REQUISITION_STALE_DAYS`

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้
