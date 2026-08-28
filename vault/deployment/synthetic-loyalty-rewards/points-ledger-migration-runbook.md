---
layer: deployment
tags: [migration, runbook, database]
created: 2026-07-04
---

# Points Ledger Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อเพิ่ม column ใน `point_transactions` หรือ `point_accounts` ต้องทำ online migration เพราะตารางขนาดใหญ่และมี write ตลอดเวลา

## ขั้นตอน

1) เพิ่ม column แบบ nullable ก่อน 2) backfill ใน batch ไม่เกิน 5,000 rows ต่อ batch ห่างกัน 100ms 3) เพิ่ม NOT NULL constraint เมื่อ backfill เสร็จ 4) deploy code ที่ใช้ column ใหม่
