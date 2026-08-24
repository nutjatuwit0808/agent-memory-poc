---
layer: business-logic
tags: [load, policy]
created: 2026-01-30
links:
  - "[[structure/synthetic-analytics-pipeline/module-warehouse-loader]]"
---

# นโยบายป้องกันแถวข้อมูลซ้ำ

[[structure/synthetic-analytics-pipeline/module-warehouse-loader]] ใช้ deterministic row key (ผสมจาก source id, extract timestamp, และ primary key ของต้นทาง) เพื่อตรวจจับแถวที่โหลดซ้ำก่อนเขียนเข้า warehouse ทุกครั้ง ไม่พึ่ง unique constraint ของ warehouse ฝ่ายเดียว

การโหลดแบบ `upsert` ใช้ row key นี้ตัดสินว่าควร insert หรือ update แถวเดิม ส่วนการโหลดแบบ `append` จะปฏิเสธแถวที่ row key ซ้ำกับที่มีอยู่แล้วทันที ไม่ insert ซ้ำไม่ว่ากรณีใด
