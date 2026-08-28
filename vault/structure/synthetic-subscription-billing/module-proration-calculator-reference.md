---
layer: structure
tags: [proration, module, core, reference, identifiers]
created: 2025-10-28
links:
  - "[[structure/synthetic-subscription-billing/module-proration-calculator]]"
  - "[[business-logic/synthetic-subscription-billing/proration-method-selection-policy]]"
---

# proration-calculator — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด proration-calculator สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-subscription-billing/module-proration-calculator]])

## Public functions
- `calculateProration(subscriptionId: string, oldPlanId: string, newPlanId: string, changeDate: string): Promise<ProrationResult>` — คำนวณส่วนต่างค่าบริการจากการเปลี่ยนแพลน
- `getProrationMethod(planId: string): Promise<"daily" | "monthly">` — คืนวิธีคำนวณ proration ที่ใช้กับแพลนนั้น

## Internal constants
- `PRORATION_ROUNDING_PRECISION = 2`
- `MIN_PRORATION_AMOUNT_THB = 1`

## Type

```ts
interface ProrationResult {
  creditAmount: number;
  chargeAmount: number;
  netAmount: number;
  method: "daily" | "monthly";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องวิธีคำนวณที่ [[business-logic/synthetic-subscription-billing/proration-method-selection-policy]]
