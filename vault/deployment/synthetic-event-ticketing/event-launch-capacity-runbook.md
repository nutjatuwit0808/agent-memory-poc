---
layer: deployment
tags: [scaling, runbook]
created: 2026-03-09
links:
  - "[[structure/synthetic-event-ticketing/module-seat-inventory]]"
  - "[[structure/synthetic-event-ticketing/module-reservation-engine]]"
---

# Event Launch Capacity Runbook

ขั้นตอนเตรียมความพร้อมก่อนเปิดขายบัตรงานยอดนิยมที่คาดว่าจะมีผู้เข้าใช้พร้อมกันจำนวนมาก

## ก่อนเปิดขาย

scale [[structure/synthetic-event-ticketing/module-seat-inventory]] และ [[structure/synthetic-event-ticketing/module-reservation-engine]] ล่วงหน้าตามจำนวนที่นั่งและระดับความนิยมที่คาดการณ์ ไม่รอ autoscale ตอบสนองแบบ reactive เพราะ traffic พุ่งขึ้นทันทีตอนเปิดขายไม่ใช่ค่อยๆ เพิ่ม

## ระหว่างเปิดขาย

เปิดใช้ waiting room (จำกัดจำนวนคนเข้าหน้าซื้อพร้อมกัน) สำหรับงานที่คาดว่า demand จะสูงกว่าจำนวนที่นั่งมาก เพื่อป้องกันระบบล่มจาก traffic พุ่งพร้อมกัน
