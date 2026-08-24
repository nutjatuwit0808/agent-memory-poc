---
layer: deployment
tags: [monitoring, observability]
created: 2026-02-03
---

# Monitoring & Alerts

## Alert หลัก

moderation review queue depth เกิน 80% ของ `MODERATION_REVIEW_QUEUE_MAX_DEPTH`, fanout job ค้างเกิน 15 นาที, feed-ranker error rate เกิน 5% ใน 5 นาที

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้
