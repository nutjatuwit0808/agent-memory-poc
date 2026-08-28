---
layer: deployment
tags: [infrastructure, tracking]
created: 2026-03-12
links:
  - "[[structure/synthetic-food-delivery/module-driver-dispatch]]"
---

# Driver Location Tracking Infrastructure

เอกสารนี้อธิบาย infrastructure ที่รองรับ location update จากคนขับทุกคนแบบ real-time — แยกจาก REST API ปกติเพราะ traffic pattern แตกต่างกันมาก

## WebSocket cluster

[[structure/synthetic-food-delivery/module-driver-dispatch]] รับ location update ผ่าน WebSocket cluster ที่ auto-scale ตามจำนวน connection ใน peak hour มีคนขับ online พร้อมกัน 2,000-5,000 คน ทำให้ connection count สูงกว่า REST request มาก

## Location log storage

Location history ทุก point ถูก append-only log ไว้ใน time-series store แยกต่างหาก ไม่ลบทิ้ง ใช้วิเคราะห์ route pattern ย้อนหลัง และเป็น evidence เมื่อมีข้อพิพาทระหว่างลูกค้ากับคนขับ
