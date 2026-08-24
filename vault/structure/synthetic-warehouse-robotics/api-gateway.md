---
layer: structure
tags: [warehouse-robotics, warebot, gateway, api]
created: 2026-04-05
links:
  - "[[structure/synthetic-warehouse-robotics/module-task-scheduler]]"
  - "[[structure/synthetic-warehouse-robotics/module-safety-zone-monitor]]"
---

# API Gateway

คำสั่งจาก WMS ภายนอกเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลง order line เป็น pick task แล้วส่งต่อให้ [[structure/synthetic-warehouse-robotics/module-task-scheduler]] คำขอที่ต้องการผลลัพธ์ทันที เช่น เช็คสถานะ task ปัจจุบัน ใช้ synchronous call ตรงนี้

คำสั่งควบคุมหุ่นยนต์ระดับ real-time (เช่น emergency stop) ไม่ผ่าน API gateway ตัวนี้ — ไปทาง low-latency channel แยกต่างหากที่ [[structure/synthetic-warehouse-robotics/module-safety-zone-monitor]] ควบคุมเอง เพราะ latency ของ gateway กลาง (เฉลี่ย 80-150ms) ช้าเกินไปสำหรับคำสั่งหยุดฉุกเฉิน
