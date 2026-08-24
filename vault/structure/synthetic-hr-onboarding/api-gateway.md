---
layer: structure
tags: [hr-onboarding, onboardflow, gateway, api]
created: 2026-04-28
links:
  - "[[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]]"
---

# API Gateway

คำขอจาก HR ผ่าน internal admin console เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลงคำสั่ง เช่น "เริ่ม onboarding ให้พนักงานคนนี้" เป็นการเรียก [[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]] โดยตรง คำขอที่ต้องรอผลทันที เช่น เช็คสถานะ case ปัจจุบัน ใช้ synchronous call

Webhook ขาเข้าจาก vendor ภายนอก (e-signature vendor, background check vendor) ไม่ผ่าน API gateway ตัวเดียวกับ admin console — มี endpoint แยกต่างหากที่ตรวจ signature ของ webhook เองก่อนส่งต่อเข้าคิว เพราะ payload จาก vendor ภายนอกต้อง validate เข้มกว่าคำขอภายในบริษัท
