---
layer: deployment
tags: [monitoring, observability]
created: 2026-02-21
links:
  - "[[structure/synthetic-analytics-pipeline/module-job-orchestrator]]"
---

# Monitoring & Alerts

## Alert หลัก

job queue depth ของ [[structure/synthetic-analytics-pipeline/module-job-orchestrator]] เกิน 80% ของ `DAG_MAX_CONCURRENT_JOBS`, extract failure rate เกิน 10% ของ source ทั้งหมดใน 1 ชั่วโมง, quality check fail ระดับ critical ทุกครั้ง

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้
