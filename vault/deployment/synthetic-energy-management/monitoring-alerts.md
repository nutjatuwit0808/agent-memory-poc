---
layer: deployment
tags: [monitoring, observability]
created: 2026-06-12
---

# Monitoring & Alerts

## Alert หลัก

meter offline เกิน `METER_OFFLINE_THRESHOLD_MIN` นาที, demand response trigger ที่ไม่ resolve ภายใน 1 ชั่วโมง, MQTT broker queue depth เกิน threshold ช่วง peak hour

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้
