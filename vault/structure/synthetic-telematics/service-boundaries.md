---
layer: structure
tags: [telematics, drivelog, boundaries]
created: 2026-08-16
links:
  - "[[structure/synthetic-telematics/module-trip-collector]]"
  - "[[structure/synthetic-telematics/module-driving-scorer]]"
  - "[[structure/synthetic-telematics/module-premium-adjuster]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-telematics/module-trip-collector]] เป็นเจ้าของข้อมูล GPS trace ดิบทั้งหมด ส่วน [[structure/synthetic-telematics/module-driving-scorer]] เก็บแค่คะแนนที่คำนวณแล้ว ไม่เก็บ raw trace ซ้ำ

[[structure/synthetic-telematics/module-premium-adjuster]] ไม่คำนวณคะแนนเอง อ่านผลจาก [[structure/synthetic-telematics/module-driving-scorer]] เท่านั้น เพื่อให้มีจุดเดียวที่ตัดสินใจว่าพฤติกรรมการขับขี่หนึ่งครั้งได้คะแนนเท่าไหร่ ไม่ให้ logic การให้คะแนนกระจายอยู่หลายที่จนไม่สอดคล้องกัน
