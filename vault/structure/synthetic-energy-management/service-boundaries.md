---
layer: structure
tags: [energy-management, gridsync, boundaries]
created: 2025-12-29
links:
  - "[[structure/synthetic-energy-management/module-meter-collector]]"
  - "[[structure/synthetic-energy-management/module-carbon-calculator]]"
  - "[[structure/synthetic-energy-management/module-demand-response-controller]]"
  - "[[structure/synthetic-energy-management/module-equipment-scheduler]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-energy-management/module-meter-collector]] เป็นเจ้าของข้อมูลดิบจาก meter ทั้งหมด ส่วน [[structure/synthetic-energy-management/module-carbon-calculator]] เก็บแค่ผลการคำนวณคาร์บอนฟุตพรินต์ที่ประมวลผลแล้ว ไม่เก็บข้อมูลดิบซ้ำ

[[structure/synthetic-energy-management/module-demand-response-controller]] ไม่เขียนคำสั่งควบคุมอุปกรณ์โดยตรง แต่ส่งคำสั่งผ่าน [[structure/synthetic-energy-management/module-equipment-scheduler]] เท่านั้น เพื่อให้มีจุดเดียวที่ตัดสินใจลำดับความสำคัญเมื่อคำสั่งจากหลายแหล่งขัดแย้งกัน
