---
layer: structure
tags: [event-ticketing, ticketnode, boundaries]
created: 2026-04-18
links:
  - "[[structure/synthetic-event-ticketing/module-seat-inventory]]"
  - "[[structure/synthetic-event-ticketing/module-reservation-engine]]"
  - "[[structure/synthetic-event-ticketing/module-resale-marketplace]]"
  - "[[structure/synthetic-event-ticketing/module-transfer-processor]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-event-ticketing/module-seat-inventory]] เป็นเจ้าของสถานะที่นั่งทั้งหมด ส่วน [[structure/synthetic-event-ticketing/module-reservation-engine]] เก็บแค่ข้อมูลการจอง (ใครจองที่นั่งไหน) ไม่แตะสถานะที่นั่งดิบโดยตรง

[[structure/synthetic-event-ticketing/module-resale-marketplace]] ไม่มีสิทธิ์แก้ไขสถานะที่นั่งใน [[structure/synthetic-event-ticketing/module-seat-inventory]] โดยตรง ต้องผ่าน [[structure/synthetic-event-ticketing/module-transfer-processor]] เสมอเพื่อให้การโอนกรรมสิทธิ์บัตรทุกเส้นทาง (โอนปกติ, ขายต่อ) ผ่าน validation เดียวกัน
