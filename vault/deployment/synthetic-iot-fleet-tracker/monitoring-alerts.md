---
layer: deployment
tags: [monitoring, observability]
created: 2026-02-23
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]]"
---

# Monitoring & Alerts

## Alert หลัก

ping ingestion rate ตกต่ำกว่า 80% ของค่าเฉลี่ยช่วงเวลาเดียวกันของสัปดาห์ก่อน, device offline rate เกิน 5% ของฟลีทพร้อมกัน, WebSocket queue depth ของ [[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]] เกิน threshold

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้
