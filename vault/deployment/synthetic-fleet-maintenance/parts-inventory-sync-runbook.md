---
layer: deployment
tags: [parts, audit, runbook]
created: 2026-03-18
links:
  - "[[structure/synthetic-fleet-maintenance/module-parts-inventory]]"
---

# Parts Inventory Physical Sync Runbook

ขั้นตอน reconcile สต็อก physical กับ system เมื่อพบ discrepancy ในการ audit

## ความถี่

Cycle count แบบสุ่มสำหรับ fast-moving parts ทุกสัปดาห์ Physical audit ทั้งคลังทุกไตรมาส

## ขั้นตอนแก้ discrepancy

1) หยุดรับ work order ใหม่สำหรับ part นั้นชั่วคราว 2) นับ physical จริง 3) เทียบกับ system ผ่าน [[structure/synthetic-fleet-maintenance/module-parts-inventory]] 4) แก้ด้วยมือผ่าน Purchasing Manager approval 5) บันทึก adjustment reason
