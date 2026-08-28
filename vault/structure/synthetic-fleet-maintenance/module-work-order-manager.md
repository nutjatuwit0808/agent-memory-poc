---
layer: structure
tags: [work-order, module, core]
created: 2026-02-24
links:
  - "[[structure/synthetic-fleet-maintenance/module-parts-inventory]]"
  - "[[business-logic/synthetic-fleet-maintenance/work-order-priority-escalation-policy]]"
  - "[[structure/synthetic-fleet-maintenance/module-downtime-tracker]]"
---

# Module: work-order-manager

สร้างและจัดการ work order สำหรับทั้งการซ่อมฉุกเฉินและการบำรุงรักษาตามแผน บันทึก parts ที่ใช้ไปใน work order แต่ละใบ และส่ง event เมื่อ work order ปิดเพื่อให้ service อื่นรับรู้ แยกออกมาเพราะ work order lifecycle มีหลาย state และหลาย actor ที่เกี่ยวข้อง

## ฟังก์ชันหลัก
- `createWorkOrder(vehicleId: string, type: WorkOrderType, priority: Priority, description: string): Promise<WorkOrderId>` — สร้าง work order ใหม่ คืน ID
- `assignTechnician(workOrderId: string, technicianId: string): Promise<void>` — มอบหมายช่างให้ work order ตรวจ certification ของช่างก่อนมอบหมาย
- `recordPartsUsed(workOrderId: string, parts: PartUsage[]): Promise<void>` — บันทึก parts ที่ใช้ไป trigger deduction ใน [[structure/synthetic-fleet-maintenance/module-parts-inventory]] พร้อมกัน
- `closeWorkOrder(workOrderId: string, closedBy: string, notes: string): Promise<void>` — ปิด work order ตรวจว่า parts บันทึกครบก่อนปิด ดู [[business-logic/synthetic-fleet-maintenance/work-order-priority-escalation-policy]]

## State

open → assigned → in_progress → pending_parts (รอ parts) | done → closed — escalated สามารถเกิดได้จากทุก state ถ้าเกิน SLA ดู [[business-logic/synthetic-fleet-maintenance/work-order-priority-escalation-policy]]

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-fleet-maintenance/module-downtime-tracker]] subscribe `workorder.opened` และ `workorder.closed` เพื่อคำนวณ downtime duration โดยอัตโนมัติ work-order-manager ไม่รู้ว่า downtime clock ทำงานอยู่หรือเปล่า
