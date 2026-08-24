---
layer: deployment
tags: [monitoring, observability]
created: 2025-09-29
---

# Monitoring & Alerts

## Alert หลัก

คิว transcode ของ live เกิน 80% ของกำลังผลิตปัจจุบัน, license issuance error rate เกิน 2% ใน 5 นาที, cache hit rate ของ origin shield ตกต่ำกว่า 90% กะทันหัน

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้
