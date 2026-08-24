---
layer: deployment
tags: [monitoring, observability]
created: 2026-03-03
---

# Monitoring & Alerts

## Alert หลัก

sensor offline rate เกิน 5% ของอาคารใน 10 นาที, work order เปิดค้างเกิน 72 ชั่วโมงโดยไม่มีคนรับ, door event `access_denied` ซ้ำเกิน 3 ครั้งใน 1 นาทีที่ประตูเดียวกัน (สงสัย tailgate หรือบัตรมีปัญหา)

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้
