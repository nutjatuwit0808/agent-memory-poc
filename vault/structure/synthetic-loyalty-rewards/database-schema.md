---
layer: structure
tags: [loyalty-rewards, pointsvault, database, schema]
created: 2025-12-14
links:
  - "[[structure/synthetic-loyalty-rewards/module-points-ledger]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-loyalty-rewards/module-points-ledger]] ดูแล ได้แก่ `point_accounts` (ยอดแต้มปัจจุบันของสมาชิกแต่ละคน), `point_transactions` (ประวัติทุก transaction ไม่ลบทิ้ง), และ `pending_credits` (แต้มที่รอยืนยันจาก partner)

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `point_accounts` | points-ledger | อัปเดตทุกครั้งที่มี credit/debit |
| `point_transactions` | points-ledger | append-only ไม่มีการลบ |
| `tier_status` | tier-calculator | อัปเดตทุกสัปดาห์และหลัง threshold crossing |
| `redemption_orders` | redemption-engine | ประวัติการแลกรางวัล |
| `member_offers` | offer-personalizer | offer ที่ generate ให้สมาชิกแต่ละคน |

ทุกตารางมี `account_id` เป็น reference ร่วมแบบ soft reference ไม่มี FK constraint ข้าม service ตรวจสอบความสอดคล้องด้วย reconciliation job รายสัปดาห์แทน
