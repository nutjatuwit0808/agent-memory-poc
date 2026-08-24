---
layer: structure
tags: [scheduling, module, core]
created: 2026-06-24
links:
  - "[[structure/synthetic-warehouse-robotics/module-fleet-controller]]"
  - "[[structure/synthetic-warehouse-robotics/module-inventory-sync]]"
  - "[[structure/synthetic-warehouse-robotics/service-boundaries]]"
  - "[[structure/synthetic-warehouse-robotics/module-picking-engine]]"
  - "[[business-logic/synthetic-warehouse-robotics/task-timeout-policy]]"
---

# Module: task-scheduler

แปลง order line จาก WMS เป็น pick task แล้วมอบหมายให้หุ่นยนต์ที่เหมาะสม เป็น service เดียวที่ query ข้าม [[structure/synthetic-warehouse-robotics/module-fleet-controller]] และ [[structure/synthetic-warehouse-robotics/module-inventory-sync]] พร้อมกันได้ (ข้อยกเว้นที่ตั้งใจ ดู [[structure/synthetic-warehouse-robotics/service-boundaries]])

## ฟังก์ชันหลัก
- `enqueueTask(orderLineId: string, sku: string, qty: number): Promise<string>` — สร้าง pick task ใหม่เข้าคิว คืน taskId
- `assignNextTask(): Promise<Assignment | null>` — จับคู่ task ที่รอนานที่สุดกับหุ่นยนต์ที่ว่างและใกล้ที่สุด
- `requeueTask(taskId: string, reason: string): Promise<void>` — ดันงานกลับเข้าคิวเมื่อ pick ล้มเหลวแบบ retry ได้

## State

queued → assigned → in_progress → done | requeued | stuck

## ความสัมพันธ์กับ module อื่น

ถ้า task อยู่ใน `assigned` นานเกิน threshold โดยไม่มี heartbeat ความคืบหน้าจาก [[structure/synthetic-warehouse-robotics/module-picking-engine]] ระบบจะ mark เป็น `stuck` — นี่คือปัญหาที่ทำให้เกิด support case จำนวนมากช่วง peak hour ดู [[business-logic/synthetic-warehouse-robotics/task-timeout-policy]]
