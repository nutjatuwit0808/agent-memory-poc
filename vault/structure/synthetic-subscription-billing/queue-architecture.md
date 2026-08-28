---
layer: structure
tags: [subscription-billing, recurflow, queue, async]
created: 2026-07-29
links:
  - "[[structure/synthetic-subscription-billing/module-dunning-engine]]"
  - "[[structure/synthetic-subscription-billing/module-proration-calculator]]"
  - "[[structure/synthetic-subscription-billing/module-plan-manager]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `plan.changed`, `invoice.generated`, `payment.failed`, `payment.succeeded`, `trial.expiring`, `usage.threshold_exceeded` — [[structure/synthetic-subscription-billing/module-dunning-engine]] subscribe `payment.failed` เพื่อเริ่มกระบวนการ retry การเรียกเก็บเงินอัตโนมัติ

[[structure/synthetic-subscription-billing/module-proration-calculator]] ไม่ subscribe event ใดๆ เพราะเป็น pure calculation ที่ถูกเรียกแบบ synchronous จาก [[structure/synthetic-subscription-billing/module-plan-manager]] โดยตรงเมื่อมีการเปลี่ยนแพลนเท่านั้น
