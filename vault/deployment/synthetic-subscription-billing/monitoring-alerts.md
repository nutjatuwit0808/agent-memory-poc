---
layer: deployment
tags: [monitoring, observability]
created: 2026-07-17
---

# Monitoring & Alerts

## Alert หลัก

dunning retry job ล้มเหลวหรือรันซ้อน, invoice generation ล้มเหลวเกิน threshold ต่อวัน, proration calculation ที่ให้ผลลัพธ์ผิดปกติ (เช่น ค่าติดลบเกินขอบเขต)

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้
