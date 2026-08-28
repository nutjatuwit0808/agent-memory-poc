---
layer: structure
tags: [supply-chain, supplylink, database, schema]
created: 2026-01-15
links:
  - "[[structure/synthetic-supply-chain/module-purchase-order-engine]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-supply-chain/module-purchase-order-engine]] ดูแล ได้แก่ `purchase_orders` (lifecycle ของ PO แต่ละใบ), `po_line_items` (รายการสินค้าในแต่ละ PO), และ `po_amendments` (ประวัติการแก้ไข PO ทุกครั้ง ไม่ลบทิ้งเพื่อ audit)

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `purchase_orders` | purchase-order-engine | สถานะ draft→confirmed→shipped→received |
| `suppliers` | supplier-catalog | ข้อมูลซัพพลายเออร์ รวม blacklist flag |
| `shipment_events` | shipment-tracker | event log ทุก milestone |
| `inspection_results` | quality-inspection-gate | ผลตรวจสอบต่อ lot |
| `replenishment_triggers` | replenishment-trigger | trigger log และ threshold config |

ทุกตารางใช้ `supplier_id` เป็น soft reference ข้ามกัน ไม่มี FK constraint ข้าม schema จริง ความสอดคล้องตรวจสอบด้วย reconciliation job รายคืนแทน เพื่อให้ service แต่ละตัว deploy อิสระจากกัน
