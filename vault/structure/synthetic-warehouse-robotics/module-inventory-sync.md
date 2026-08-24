---
layer: structure
tags: [inventory, module]
created: 2026-07-28
links:
  - "[[structure/synthetic-warehouse-robotics/service-boundaries]]"
  - "[[structure/synthetic-warehouse-robotics/module-picking-engine]]"
  - "[[structure/synthetic-warehouse-robotics/module-task-scheduler]]"
---

# Module: inventory-sync

sync จำนวนสินค้าจริงในแต่ละ bin กับตัวเลขที่ WMS ของลูกค้าคิดว่าควรจะมี ทำงานเป็น background reconciliation เป็นหลัก ไม่ได้อยู่บน critical path ของการหยิบสินค้าโดยตรง เพื่อไม่ให้ latency ของการ sync ไปถ่วงความเร็วการหยิบ

## ฟังก์ชันหลัก
- `reconcileBin(binId: string): Promise<ReconcileResult>` — เทียบจำนวนจริง (จาก cycle count ล่าสุด) กับตัวเลขในระบบ
- `reportDiscrepancy(binId: string, expected: number, actual: number): Promise<void>` — บันทึกและแจ้ง discrepancy ที่เกินเกณฑ์ยอมรับ
- `triggerCycleCount(binId: string): Promise<void>` — สร้าง task ให้พนักงานหรือหุ่นยนต์ตรวจนับ bin นั้นใหม่

## ความสัมพันธ์กับ module อื่น

ไม่รู้จักสถานะหุ่นยนต์เลย (ดู [[structure/synthetic-warehouse-robotics/service-boundaries]]) — เมื่อ [[structure/synthetic-warehouse-robotics/module-picking-engine]] report ว่าหยิบไม่เจอสินค้า จะเป็น [[structure/synthetic-warehouse-robotics/module-task-scheduler]] ที่เรียก `triggerCycleCount` แทนที่จะให้ inventory-sync ฟัง event การหยิบโดยตรง เพื่อคุม fan-in ของ event ให้อยู่ที่ scheduler จุดเดียว
