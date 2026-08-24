---
layer: deployment
tags: [monitoring, observability]
created: 2026-03-07
---

# Monitoring & Alerts

## Alert หลัก

`verifyChainIntegrity` ล้มเหลวสำหรับ envelope ใดๆ, envelope ค้างสถานะ `pending_notarization` เกิน 24 ชั่วโมง, อัตราการส่ง reminder ล้มเหลวเกิน 5% ของ job รอบนั้น

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนกลางดึกสำหรับปัญหาที่รอถึงเช้าได้
