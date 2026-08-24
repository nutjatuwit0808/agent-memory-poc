---
layer: deployment
tags: [monitoring, observability]
created: 2026-08-18
---

# Monitoring & Alerts

## Alert หลัก

critical lab value ที่ยังไม่ถูก acknowledge เกิน `CRITICAL_VALUE_ALERT_TIMEOUT_MIN`, break-glass access เกิน 5 ครั้งใน 1 ชั่วโมงจาก provider คนเดียว, audit log gap ที่ตรวจพบจาก reconciliation job

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้
