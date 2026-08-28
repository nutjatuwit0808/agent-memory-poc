---
layer: structure
tags: [work-order, module, core, reference, identifiers]
created: 2026-07-27
links:
  - "[[structure/synthetic-fleet-maintenance/module-work-order-manager]]"
  - "[[structure/synthetic-fleet-maintenance/module-parts-inventory]]"
  - "[[business-logic/synthetic-fleet-maintenance/work-order-priority-escalation-policy]]"
---

# work-order-manager — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด work-order-manager สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-fleet-maintenance/module-work-order-manager]])

## Public functions
- `createWorkOrder(vehicleId: string, type: WorkOrderType, priority: Priority, description: string): Promise<WorkOrderId>` — สร้าง work order ใหม่ คืน ID
- `assignTechnician(workOrderId: string, technicianId: string): Promise<void>` — มอบหมายช่างให้ work order ตรวจ certification ของช่างก่อนมอบหมาย
- `recordPartsUsed(workOrderId: string, parts: PartUsage[]): Promise<void>` — บันทึก parts ที่ใช้ไป trigger deduction ใน [[structure/synthetic-fleet-maintenance/module-parts-inventory]] พร้อมกัน
- `closeWorkOrder(workOrderId: string, closedBy: string, notes: string): Promise<void>` — ปิด work order ตรวจว่า parts บันทึกครบก่อนปิด ดู [[business-logic/synthetic-fleet-maintenance/work-order-priority-escalation-policy]]

## Internal constants
- `WORK_ORDER_ESCALATION_THRESHOLD_HOURS = 24`
- `MAX_PARTS_LINE_ITEMS_PER_WO = 100`
- `PARTS_RECONCILIATION_WINDOW_MIN = 15`

## Type

```ts
interface WorkOrder {
  workOrderId: string;
  vehicleId: string;
  type: "preventive" | "corrective" | "inspection";
  priority: "low" | "normal" | "high" | "critical";
  status: "open" | "assigned" | "in_progress" | "pending_parts" | "done" | "closed" | "escalated";
  technicianId?: string;
  partsUsed: PartUsage[];
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง escalation ที่ [[business-logic/synthetic-fleet-maintenance/work-order-priority-escalation-policy]]
