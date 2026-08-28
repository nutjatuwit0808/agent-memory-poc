---
layer: structure
tags: [plan, module, core, reference, identifiers]
created: 2026-05-06
links:
  - "[[structure/synthetic-subscription-billing/module-plan-manager]]"
  - "[[business-logic/synthetic-subscription-billing/downgrade-effective-date-policy]]"
---

# plan-manager — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด plan-manager สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-subscription-billing/module-plan-manager]])

## Public functions
- `changePlan(subscriptionId: string, newPlanId: string, effectiveDate?: string): Promise<string>` — เปลี่ยนแพลน คำนวณวันที่มีผลตามนโยบาย คืน changeId
- `getCurrentPlan(subscriptionId: string): Promise<PlanDetail>` — คืนแพลนปัจจุบันของ subscription หนึ่ง
- `getPlanChangeHistory(subscriptionId: string): Promise<PlanChange[]>` — คืนประวัติการเปลี่ยนแพลนทั้งหมด

## Internal constants
- `PLAN_CHANGE_COOLDOWN_HOURS = 24`
- `PLAN_HISTORY_RETENTION_YEARS = 7`

## Type

```ts
interface PlanDetail {
  subscriptionId: string;
  planId: string;
  effectiveSince: string;
  status: "active" | "pending_change" | "cancelled";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง downgrade ที่ [[business-logic/synthetic-subscription-billing/downgrade-effective-date-policy]]
