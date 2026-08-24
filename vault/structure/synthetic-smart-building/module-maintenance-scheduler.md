---
layer: structure
tags: [maintenance, module]
created: 2026-06-30
links:
  - "[[structure/synthetic-smart-building/module-occupancy-sensor-hub]]"
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
  - "[[business-logic/synthetic-smart-building/maintenance-work-order-dedup-policy]]"
---

# Module: maintenance-scheduler

สร้างและติดตาม work order สำหรับงานซ่อมบำรุง ทั้งจาก fault event อัตโนมัติที่ module อื่นส่งเข้ามาและคำขอที่พนักงานอาคารกรอกเอง แยกออกมาจาก alert-dispatcher ตั้งแต่ต้นเพราะ lifecycle ของ work order (มอบหมายช่าง, ติดตามสถานะ, ปิดงาน) ซับซ้อนกว่าการแค่ส่ง alert มาก

## ฟังก์ชันหลัก
- `createWorkOrder(sourceEventId: string, zoneId: string, category: FaultCategory): Promise<string>` — สร้าง work order ใหม่ คืน workOrderId
- `dedupWorkOrder(zoneId: string, category: FaultCategory): Promise<string | null>` — เช็คว่ามี work order เปิดอยู่แล้วสำหรับ fault ประเภทเดียวกันในโซนเดียวกันหรือไม่
- `closeWorkOrder(workOrderId: string, resolvedBy: string, note: string): Promise<void>` — ปิดงานหลังช่างยืนยันแก้ไขเสร็จ
- `reopenWorkOrder(workOrderId: string, reason: string): Promise<void>` — เปิดงานกลับเมื่อพบว่า fault เดิมยังไม่หายจริง

## State

open → assigned → resolved → closed หรือ reopened (จาก resolved/closed ถ้า fault เดิมกลับมา)

## ความสัมพันธ์กับ module อื่น

ไม่รู้ว่า fault แต่ละอันมาจาก sensor ตัวไหนใน [[structure/synthetic-smart-building/module-occupancy-sensor-hub]] หรือ [[structure/synthetic-smart-building/module-hvac-controller]] โดยตรง — รู้แค่ `zoneId` กับ `category` ที่ module ต้นทางส่งมา ดู [[business-logic/synthetic-smart-building/maintenance-work-order-dedup-policy]] สำหรับกติกากันงานซ้ำ
