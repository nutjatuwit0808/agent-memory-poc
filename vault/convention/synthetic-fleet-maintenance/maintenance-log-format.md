---
layer: convention
tags: [logging, maintenance]
created: 2026-06-05
---

# Maintenance Log Format

## Field ที่บังคับมีใน work order log

`work_order_id`, `vehicle_id`, `technician_id`, `service_type`, `parts_used` (list), `odometer_at_service`, `start_time`, `end_time`

## การอ้างอิงข้าม record

ถ้า work order เกิดจาก maintenance trigger ต้องระบุ `maintenance_schedule_id` ที่ trigger ด้วย เพื่อ trace กลับได้ว่า schedule ใดสร้าง work order นี้
