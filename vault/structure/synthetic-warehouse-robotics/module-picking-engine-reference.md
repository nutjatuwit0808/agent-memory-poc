---
layer: structure
tags: [picking, module, core, reference, identifiers]
created: 2026-03-18
links:
  - "[[structure/synthetic-warehouse-robotics/module-picking-engine]]"
  - "[[business-logic/synthetic-warehouse-robotics/pick-retry-policy]]"
---

# picking-engine — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด picking-engine สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-warehouse-robotics/module-picking-engine]])

## Public functions
- `attemptPick(robotId: string, binId: string, sku: string): Promise<PickResult>` — สั่งหยิบจริง 1 ครั้ง คืนผลว่าสำเร็จ/พลาด/ไม่พบสินค้า
- `computeGripProfile(sku: string): GripProfile` — คำนวณแรงบีบและมุมจับตาม product profile ของ SKU นั้น
- `reportPickFailure(taskId: string, reason: PickFailReason): Promise<void>` — แจ้งผลพลาดกลับไปยัง task-scheduler พร้อมเหตุผลที่จัดหมวดไว้แล้ว

## Internal constants
- `MAX_PICK_RETRY_ATTEMPTS = 2`
- `GRIP_FORCE_SAFETY_CAP_N = 45`
- `DEFAULT_APPROACH_ANGLE_DEG = 30`

## Type

```ts
interface PickResult {
  taskId: string;
  status: "succeeded" | "failed_soft" | "failed_hard";
  failReason?: "not_found" | "grip_slip" | "obstruction";
  attemptCount: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-warehouse-robotics/pick-retry-policy]]
