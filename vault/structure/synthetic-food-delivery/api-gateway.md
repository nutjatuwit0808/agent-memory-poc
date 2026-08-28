---
layer: structure
tags: [food-delivery, quickbite, gateway, api]
created: 2026-05-10
links:
  - "[[structure/synthetic-food-delivery/module-order-router]]"
  - "[[structure/synthetic-food-delivery/module-driver-dispatch]]"
---

# API Gateway

คำสั่งจากแอปลูกค้าและร้านอาหารเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ auth แล้วส่งต่อให้ [[structure/synthetic-food-delivery/module-order-router]] คำขอที่ต้องการผลทันที เช่น เช็กสถานะออร์เดอร์หรือตำแหน่งคนขับแบบ real-time ใช้ synchronous call ผ่านตรงนี้

การอัปเดตตำแหน่งคนขับไม่ผ่าน API gateway ตัวนี้ — ไปทาง WebSocket channel แยกต่างหากที่ [[structure/synthetic-food-delivery/module-driver-dispatch]] ควบคุมเอง เพราะ frequency สูง (ทุก 3-5 วินาทีต่อคนขับ) และต้องการ latency ต่ำกว่าที่ gateway กลางจะรับไหว
