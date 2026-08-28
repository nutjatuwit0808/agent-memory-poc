---
layer: structure
tags: [plan, module, core]
created: 2025-09-01
links:
  - "[[business-logic/synthetic-subscription-billing/downgrade-effective-date-policy]]"
  - "[[structure/synthetic-subscription-billing/module-proration-calculator]]"
---

# Module: plan-manager

จัดการสถานะแพลนปัจจุบันของทุก subscription และการเปลี่ยนแพลน (upgrade/downgrade) เป็น service เดียวที่ตัดสินใจว่า subscription หนึ่งอยู่แพลนไหนในเวลาใด แยกออกมาเป็น service อิสระเพราะการเปลี่ยนแพลนมีกฎทางธุรกิจที่ซับซ้อนและเปลี่ยนแปลงบ่อยตามกลยุทธ์ราคาของบริษัท

## ฟังก์ชันหลัก
- `changePlan(subscriptionId: string, newPlanId: string, effectiveDate?: string): Promise<string>` — เปลี่ยนแพลน คำนวณวันที่มีผลตามนโยบาย คืน changeId
- `getCurrentPlan(subscriptionId: string): Promise<PlanDetail>` — คืนแพลนปัจจุบันของ subscription หนึ่ง
- `getPlanChangeHistory(subscriptionId: string): Promise<PlanChange[]>` — คืนประวัติการเปลี่ยนแพลนทั้งหมด

## State

active (planA) → change_requested → active (planB) — ดู [[business-logic/synthetic-subscription-billing/downgrade-effective-date-policy]] สำหรับวันที่มีผลของ downgrade

## ความสัมพันธ์กับ module อื่น

ทุกครั้งที่เปลี่ยนแพลนสำเร็จ publish event `plan.changed` ให้ [[structure/synthetic-subscription-billing/module-proration-calculator]] เรียกแบบ synchronous เพื่อคำนวณส่วนต่างค่าบริการทันที
