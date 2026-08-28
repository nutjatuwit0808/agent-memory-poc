---
layer: deployment
tags: [monitoring, observability]
created: 2026-07-23
---

# Monitoring & Alerts

## Alert หลัก

signal reject rate > 1%, false positive rate > 5% (30-min window), case queue depth > 500, ML scoring timeout rate > 2%, SLA breach rate > 10%, case auto-close anomaly (rate ผิดปกติจาก pattern ปกติ)

## ช่องทางแจ้งเตือน

Sev1/Sev2 แจ้งทันทีทาง pager ส่วน Sev3 รวม digest รายชั่วโมง alert ที่เกี่ยวกับ false positive ต้อง cc ทีม Customer Support เสมอเพราะส่งผลตรงๆ ต่อ customer experience
