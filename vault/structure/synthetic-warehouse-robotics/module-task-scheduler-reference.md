---
layer: structure
tags: [scheduling, module, core, reference, identifiers]
created: 2025-10-07
links:
  - "[[structure/synthetic-warehouse-robotics/module-task-scheduler]]"
  - "[[business-logic/synthetic-warehouse-robotics/task-timeout-policy]]"
---

# task-scheduler — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด task-scheduler สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-warehouse-robotics/module-task-scheduler]])

## Public functions
- `enqueueTask(orderLineId: string, sku: string, qty: number): Promise<string>` — สร้าง pick task ใหม่เข้าคิว คืน taskId
- `assignNextTask(): Promise<Assignment | null>` — จับคู่ task ที่รอนานที่สุดกับหุ่นยนต์ที่ว่างและใกล้ที่สุด
- `requeueTask(taskId: string, reason: string): Promise<void>` — ดันงานกลับเข้าคิวเมื่อ pick ล้มเหลวแบบ retry ได้

## Internal constants
- `TASK_QUEUE_MAX_DEPTH = 500`
- `REASSIGN_COOLDOWN_MS = 3000`

## Type

```ts
interface Assignment {
  taskId: string;
  robotId: string;
  binId: string;
  priority: "normal" | "expedited";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง timeout ที่ [[business-logic/synthetic-warehouse-robotics/task-timeout-policy]]
