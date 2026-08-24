---
layer: business-logic
tags: [picking, quality, policy]
created: 2026-06-27
links:
  - "[[structure/synthetic-warehouse-robotics/module-picking-engine]]"
---

# นโยบายเมื่อพบสินค้าเสียหายระหว่างหยิบ

ถ้า [[structure/synthetic-warehouse-robotics/module-picking-engine]] ตรวจพบว่าสินค้าเสียหาย (จาก sensor แรงกดผิดปกติหรือกล้องตรวจสภาพ) จะไม่หยิบสินค้าชิ้นนั้นต่อ และ mark task เป็น `damaged_item_flagged` แทนที่จะรายงานเป็น pick failure ธรรมดา

สินค้าที่ถูก flag จะเข้าคิวตรวจสอบโดยพนักงานคลังก่อนตัดสินใจว่าจะทิ้งหรือส่งกลับซัพพลายเออร์ ไม่มีการหยิบซ้ำอัตโนมัติสำหรับ task ประเภทนี้
