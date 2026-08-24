---
layer: deployment
tags: [monitoring, observability]
created: 2026-05-17
links:
  - "[[structure/synthetic-chat-support-bot/module-handoff-router]]"
---

# Monitoring & Alerts

## Alert หลัก

ความลึกคิว [[structure/synthetic-chat-support-bot/module-handoff-router]] เกิน 80% ของ `HANDOFF_MAX_QUEUE_DEPTH`, intent confidence เฉลี่ยตกต่ำกว่าปกติผิดสังเกตใน 15 นาที, rate limiter ปฏิเสธข้อความเกิน 10% ของ traffic รวม

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้
