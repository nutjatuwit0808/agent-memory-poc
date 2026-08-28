---
layer: structure
tags: [asset-management, assettrack, database, schema]
created: 2026-06-10
links:
  - "[[structure/synthetic-asset-management/module-asset-registry]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-asset-management/module-asset-registry]] ดูแล ได้แก่ `assets` (ข้อมูลหลักของสินทรัพย์แต่ละชิ้น), `asset_history` (ประวัติการเปลี่ยนแปลงสถานะทั้งหมด ไม่ลบทิ้งเพื่อ audit), และ `asset_locations`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `assets` | asset-registry | อัปเดตเมื่อมีการเปลี่ยนสถานะ |
| `license_pools` | license-pool-manager | จำนวน seat ที่มีและที่ใช้ไป |
| `depreciation_schedules` | depreciation-engine | ตารางค่าเสื่อมราคารายปี |
| `procurement_requests` | procurement-handler | ประวัติ request และ approval |
| `assignments` | assignment-tracker | mapping สินทรัพย์ → พนักงาน/สถานที่ |
| `disposal_records` | disposal-workflow | ใบรับรองการทำลายและ audit trail |

ทุกตารางใช้ `asset_id` เป็น foreign key ร่วมกันแบบ soft reference โดย `asset-registry` เป็นเจ้าของ `asset_id` เพียงผู้เดียว module อื่นอ้างอิงผ่าน ID โดยไม่มี FK constraint ข้าม schema จริง ความสอดคล้องตรวจสอบด้วย nightly reconciliation job
