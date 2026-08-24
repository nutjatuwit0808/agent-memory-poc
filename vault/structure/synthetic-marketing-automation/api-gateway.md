---
layer: structure
tags: [marketing-automation, wavecast, gateway, api]
created: 2026-07-16
links:
  - "[[structure/synthetic-marketing-automation/module-campaign-builder]]"
---

# API Gateway

คำสั่งจากทีม marketing ผ่าน admin console เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลงคำสั่ง เช่น "สร้าง campaign ใหม่" เป็นการเรียก [[structure/synthetic-marketing-automation/module-campaign-builder]] คำขอที่ต้องการผลทันที เช่น preview เนื้อหา template ใช้ synchronous call

Webhook ขาเข้าจาก ESP ภายนอก (bounce, complaint, blacklist event) ไม่ผ่าน API gateway ตัวเดียวกับ admin console — มี endpoint แยกที่ validate signature ของ ESP เองก่อนส่งเข้าคิว เพราะ volume ของ webhook ประเภทนี้สูงกว่าคำขอภายในมาก และต้องรับได้แม้ admin console จะล่ม
