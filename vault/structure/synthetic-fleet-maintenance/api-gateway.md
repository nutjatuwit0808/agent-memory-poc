---
layer: structure
tags: [fleet-maintenance, wrenchhub, gateway, api]
created: 2026-07-11
links:
  - "[[structure/synthetic-fleet-maintenance/module-work-order-manager]]"
  - "[[structure/synthetic-fleet-maintenance/module-downtime-tracker]]"
---

# API Gateway

คำสั่งจาก Fleet Management System (FMS) ภายนอกเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลง vehicle service request เป็น work order แล้วส่งต่อให้ [[structure/synthetic-fleet-maintenance/module-work-order-manager]] คำขอที่ต้องการสถานะ work order ปัจจุบันใช้ synchronous call ผ่าน gateway ตัวนี้

การแจ้งเตือน downtime เกิน SLA ไม่ผ่าน gateway เดียวกัน — ใช้ push notification channel แยกที่ [[structure/synthetic-fleet-maintenance/module-downtime-tracker]] ควบคุมโดยตรง เพื่อให้การแจ้งเตือนถึงผู้จัดการฝ่ายปฏิบัติการได้เร็วที่สุดโดยไม่ถูก throttle จาก gateway กลาง
