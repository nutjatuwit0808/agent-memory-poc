---
layer: deployment
tags: [monitoring, observability]
created: 2025-10-05
---

# Monitoring & Alerts

## Alert หลัก

accident alert ที่ไม่ได้รับการตอบสนองภายในเวลาที่กำหนด, device heartbeat missed สะสมเกิน threshold ต่อวัน, premium adjustment job ล้มเหลวหรือรันซ้อน

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager โดยเฉพาะ accident alert ที่ไม่ตอบสนอง ส่วน Sev3 รวมเป็น digest รายวันพอ
