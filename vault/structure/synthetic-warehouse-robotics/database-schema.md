---
layer: structure
tags: [warehouse-robotics, warebot, database, schema]
created: 2026-08-12
links:
  - "[[structure/synthetic-warehouse-robotics/module-fleet-controller]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-warehouse-robotics/module-fleet-controller]] ดูแล ได้แก่ `robots` (สถานะปัจจุบันของหุ่นยนต์แต่ละตัว), `robot_fault_log` (ประวัติ fault ทั้งหมด ไม่ลบทิ้งเพื่อวิเคราะห์แนวโน้ม), และ `charging_sessions`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `robots` | fleet-controller | อัปเดตทุก 2 วินาทีจาก heartbeat |
| `bins` | inventory-sync | mapping ตำแหน่งจริง ↔ SKU |
| `pick_tasks` | task-scheduler | task queue ทั้ง pending/active/done |
| `charging_sessions` | charging-station-manager | ประวัติการชาร์จ ใช้คำนวณ battery health |

ทุกตารางใช้ `robot_id` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายคืนแทน
