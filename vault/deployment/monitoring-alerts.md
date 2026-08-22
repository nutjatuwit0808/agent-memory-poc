---
layer: deployment
tags: [monitoring, alerts, observability]
created: 2026-02-14
links:
  - "[[convention/logging-convention]]"
  - "[[deployment/scaling-policy]]"
---

# Monitoring & Alerts

## ช่องทาง alert

ทุก alert ยิงเข้า PagerDuty ก่อน แล้ว mirror เข้า Slack `#alerts` — PagerDuty เป็นตัวที่ปลุกคน on-call จริง Slack ไว้ให้ทีมอื่นเห็น context

## Alert หลักที่ตั้งไว้

| Alert | เงื่อนไข | Severity |
|---|---|---|
| High error rate | error rate > 5% ใน 5 นาที | critical |
| Payment gateway down | health check payment gateway fail 3 ครั้งติด | critical |
| Refund stuck backlog | refund สถานะ `stuck` เกิน 10 รายการ | warning |
| Queue depth สูง | message ค้างใน queue เกิน 1000 | warning |
| Replica ชน max | ดู [[deployment/scaling-policy]] | warning |

## กติกาการตั้ง alert ใหม่

alert ทุกตัวต้องมี runbook link แนบไว้ในข้อความ ไม่ใช่แค่บอกว่า "มีปัญหา" — คนที่ on-call กลางดึกต้องรู้ว่าต้องทำอะไรต่อจาก alert เพียงอย่างเดียว โดยไม่ต้องไปค้นเอกสารอื่น ดู log ที่เกี่ยวข้องได้ตามรูปแบบใน [[convention/logging-convention]]
