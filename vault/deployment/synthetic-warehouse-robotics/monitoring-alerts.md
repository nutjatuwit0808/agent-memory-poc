---
layer: deployment
tags: [monitoring, observability]
created: 2025-10-24
links:
  - "[[structure/synthetic-warehouse-robotics/module-task-scheduler]]"
---

# Monitoring & Alerts

## Alert หลัก

queue depth ของ [[structure/synthetic-warehouse-robotics/module-task-scheduler]] เกิน 80% ของ `TASK_QUEUE_MAX_DEPTH`, robot fault rate เกิน 5 ตัวใน 10 นาที, charging session ค้างสถานะ `docked` เกิน 30 นาทีโดย battery% ไม่เปลี่ยน

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้
