---
layer: structure
tags: [subscription-billing, recurflow, database, schema]
created: 2025-10-14
links:
  - "[[structure/synthetic-subscription-billing/module-plan-manager]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-subscription-billing/module-plan-manager]] ดูแล ได้แก่ `subscriptions` (สถานะปัจจุบัน), `plan_change_history`, และ `plan_catalog`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `subscriptions` | plan-manager | สถานะปัจจุบันเท่านั้น |
| `plan_change_history` | plan-manager | เก็บทุกครั้งที่เปลี่ยนแพลน ไม่ลบทิ้ง |
| `invoices` | invoice-generator | ไม่มี FK ตรงไป subscriptions ใช้ subscriptionId แบบ soft reference |
| `usage_records` | usage-meter | time-series เก็บทุกจุดข้อมูลการใช้งานดิบ |

ไม่มี FK ข้าม database จริงเพราะแยก schema กันคนละ service — ตรวจความสอดคล้องด้วย reconciliation job รายวัน (เช่น เช็คว่าทุก invoice มี subscriptionId ที่มีอยู่จริง)
