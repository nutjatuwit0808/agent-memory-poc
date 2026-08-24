---
layer: deployment
tags: [monitoring, observability]
created: 2026-03-05
---

# Monitoring & Alerts

## Alert หลัก

batch พยากรณ์ไม่เสร็จภายใน 4 ชั่วโมง, สัดส่วน SKU ที่ผลลัพธ์เป็น `partial` เกิน 10% ของ batch, WAPE รวมของ category ใดๆ เกิน 30% ติดต่อกัน 2 สัปดาห์

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนกลางดึกสำหรับปัญหาที่รอถึงเช้าได้
