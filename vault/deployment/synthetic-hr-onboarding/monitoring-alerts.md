---
layer: deployment
tags: [monitoring, observability]
created: 2025-10-24
---

# Monitoring & Alerts

## Alert หลัก

provisioning queue depth เกิน 80% ของ `PROVISION_QUEUE_MAX_DEPTH`, เอกสารค้างสถานะ `stuck` เกิน 1 ชั่วโมง, case ค้างสถานะเดียวเกิน `STAGE_TRANSITION_TIMEOUT_HOURS`

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้ถึงเช้า
