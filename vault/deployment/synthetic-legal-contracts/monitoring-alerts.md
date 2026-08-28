---
layer: deployment
tags: [monitoring, observability]
created: 2025-10-11
---

# Monitoring & Alerts

## Alert หลัก

scheduled job (renewal scan, reminder) ล้มเหลวหรือไม่รันตามกำหนด, obligation ที่เลยกำหนดสะสมเกิน 10 รายการต่อสัปดาห์, approval chain ที่ค้างเกิน 7 วันไม่มีการอนุมัติ

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้
