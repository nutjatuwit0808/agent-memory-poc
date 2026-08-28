---
layer: convention
tags: [inspection, naming]
created: 2026-04-16
---

# Inspection Report Naming

## รูปแบบ

`INSP-<vehicle-id>-<inspector-id>-<YYYYMMDDHHMMSS>` เช่น `INSP-VH0412-TEC021-20240901071530`

## การ link กลับ system

ผล inspection ทุกรายการต้อง link กลับ `work_order_id` ถ้าเกิดจาก scheduled inspection หรือ link กลับ `breakdown_event_id` ถ้าเกิดจาก breakdown
