---
layer: structure
tags: [warehouse-robotics, warebot, boundaries]
created: 2026-03-05
links:
  - "[[structure/synthetic-warehouse-robotics/module-fleet-controller]]"
  - "[[structure/synthetic-warehouse-robotics/module-inventory-sync]]"
  - "[[structure/synthetic-warehouse-robotics/module-task-scheduler]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-warehouse-robotics/module-fleet-controller]] เป็นเจ้าของสถานะหุ่นยนต์ทั้งหมด (ตำแหน่ง, แบตเตอรี่, สถานะ fault) ส่วน [[structure/synthetic-warehouse-robotics/module-inventory-sync]] เป็นเจ้าของ mapping ระหว่างตำแหน่ง bin ทางกายภาพกับ SKU เท่านั้น ไม่รู้จักสถานะหุ่นยนต์เลย

[[structure/synthetic-warehouse-robotics/module-task-scheduler]] เป็น service เดียวที่ query ข้าม service ทั้งสองฝั่งเพื่อสร้าง task — เหตุผลที่ยอมให้ service นี้ทำ cross-domain query (ผิดหลักทั่วไป) คือ task assignment ต้องเห็นทั้งสถานะหุ่นยนต์และสถานะสินค้าพร้อมกันในเวลาที่ตัดสินใจ ไม่งั้นจะเกิด race condition ระหว่างสอง service แยกกันเรียก
