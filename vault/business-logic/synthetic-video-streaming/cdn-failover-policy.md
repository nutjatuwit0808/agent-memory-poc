---
layer: business-logic
tags: [cdn, failover, policy]
created: 2026-05-18
links:
  - "[[structure/synthetic-video-streaming/module-cdn-origin-shield]]"
---

# นโยบาย Failover ระหว่าง CDN Provider

ระบบใช้ CDN provider หลักและสำรองพร้อมกัน — [[structure/synthetic-video-streaming/module-cdn-origin-shield]] ตรวจ error rate ของ provider หลักทุก 30 วินาที ถ้าเกิน 5% ติดต่อกัน 3 รอบจะสลับ traffic ไปยัง provider สำรองอัตโนมัติโดยไม่ต้องรอคนอนุมัติ

การสลับกลับมาใช้ provider หลักหลัง error หายแล้วต้องมีคนยืนยันด้วยมือเสมอ ไม่สลับกลับอัตโนมัติ เพื่อป้องกันการสลับไปมาถี่ๆ (flapping) ที่ทำให้ผู้ชมเจอ buffering ซ้ำ
