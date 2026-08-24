---
layer: business-logic
tags: [scheduling, throttling, policy]
created: 2025-11-17
links:
  - "[[structure/synthetic-warehouse-robotics/module-task-scheduler]]"
---

# นโยบาย Throttle การรับงานช่วง Peak Hour

ช่วง peak window (10:00-14:00) หากคิว [[structure/synthetic-warehouse-robotics/module-task-scheduler]] มีความลึกเกิน `TASK_QUEUE_MAX_DEPTH` ระบบจะเริ่ม throttle การรับ task ใหม่จาก WMS โดยตอบ `429 queue_full` แทนที่จะรับเข้าคิวจนล้น

WMS ฝั่งลูกค้าต้อง retry เองตาม backoff ที่ตกลงกันไว้ — ทีมเคยพิจารณาให้ WareBot รับเข้า buffer ไว้ก่อนแทน แต่ตัดสินใจไม่ทำเพราะจะทำให้ debug คิวจริงยากขึ้น
