---
layer: structure
tags: [warehouse-robotics, warebot, architecture, overview]
created: 2025-10-06
links:
  - "[[structure/synthetic-warehouse-robotics/module-picking-engine]]"
  - "[[structure/synthetic-warehouse-robotics/module-fleet-controller]]"
  - "[[structure/synthetic-warehouse-robotics/module-inventory-sync]]"
  - "[[structure/synthetic-warehouse-robotics/module-task-scheduler]]"
  - "[[structure/synthetic-warehouse-robotics/module-charging-station-manager]]"
  - "[[structure/synthetic-warehouse-robotics/module-safety-zone-monitor]]"
---

# ภาพรวมสถาปัตยกรรม WareBot — ระบบหุ่นยนต์คลังสินค้า

WareBot คือแพลตฟอร์มควบคุมหุ่นยนต์หยิบสินค้า (picking robot) ในคลังสินค้าขนาดใหญ่ ทำงานร่วมกับ Warehouse Management System (WMS) เดิมของลูกค้าแต่ละราย โดย WareBot รับผิดชอบเฉพาะชั้น "การเคลื่อนที่และหยิบจริง" ส่วน WMS ยังคงเป็นเจ้าของข้อมูล order/inventory ระดับธุรกิจ

ระบบแบ่งเป็นหลาย service ย่อยตามหน้าที่ ตั้งแต่ตัดสินใจว่าหุ่นยนต์ตัวไหนควรหยิบชิ้นไหน ไปจนถึงจัดคิวชาร์จแบตเตอรี่และเฝ้าระวังโซนความปลอดภัยที่มีคนทำงานร่วมกับหุ่นยนต์ ทีมวิศวกรรมเรียกช่วงเวลา 10:00-14:00 ว่า peak window เพราะเป็นช่วงที่ order จากอีคอมเมิร์ซไหลเข้าคลังหนาแน่นที่สุด

## Module หลัก

- **picking-engine** — รับผิดชอบตัดสินใจ "หยิบยังไง" ในระดับการเคลื่อนไหวจริงของแขนหุ่นยนต์ แยกออกมาจาก task-scheduler ตั้งแต่ต้นปี 2025 เพราะ logic การหยิบ (grip force, retry angle, การจัดการสินค้ารูปทรงแปลก) ซับซ้อนขึ้นเรื่อยๆ ดู [[structure/synthetic-warehouse-robotics/module-picking-engine]]
- **fleet-controller** — เจ้าของสถานะหุ่นยนต์ทุกตัวในคลัง (ตำแหน่ง, แบตเตอรี่, สถานะ fault, สถานะออนไลน์/ ดู [[structure/synthetic-warehouse-robotics/module-fleet-controller]]
- **inventory-sync** — sync จำนวนสินค้าจริงในแต่ละ bin กับตัวเลขที่ WMS ของลูกค้าคิดว่าควรจะมี ทำงานเป็ ดู [[structure/synthetic-warehouse-robotics/module-inventory-sync]]
- **task-scheduler** — แปลง order line จาก WMS เป็น pick task แล้วมอบหมายให้หุ่นยนต์ที่เหมาะสม เป็น ser ดู [[structure/synthetic-warehouse-robotics/module-task-scheduler]]
- **charging-station-manager** — จัดคิวการชาร์จแบตเตอรี่ให้หุ่นยนต์ทั้งหมด แยกออกมาเป็น service อิสระเพราะการจัดก ดู [[structure/synthetic-warehouse-robotics/module-charging-station-manager]]
- **safety-zone-monitor** — เฝ้าระวังโซนที่มนุษย์และหุ่นยนต์ทำงานร่วมกัน ใช้ข้อมูลจากเซ็นเซอร์ LiDAR ติดผนัง ดู [[structure/synthetic-warehouse-robotics/module-safety-zone-monitor]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-warehouse-robotics/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-warehouse-robotics/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-warehouse-robotics/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-warehouse-robotics/database-schema]]
