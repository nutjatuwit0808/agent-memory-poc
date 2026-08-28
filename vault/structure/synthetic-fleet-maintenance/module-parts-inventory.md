---
layer: structure
tags: [inventory, parts, module, core]
created: 2026-03-02
links:
  - "[[business-logic/synthetic-fleet-maintenance/parts-minimum-stock-policy]]"
  - "[[structure/synthetic-fleet-maintenance/module-reorder-trigger]]"
  - "[[structure/synthetic-fleet-maintenance/module-work-order-manager]]"
---

# Module: parts-inventory

ติดตามปริมาณอะไหล่คงเหลือในคลัง บันทึก reorder point ต่อ part และ publish event เมื่อสต็อกต่ำกว่า threshold แยกออกมาเป็น service อิสระเพราะการจัดการ inventory มีความซับซ้อนของตัวเองเรื่อง concurrent update จากหลาย work order พร้อมกัน

## ฟังก์ชันหลัก
- `deductStock(partId: string, quantity: number, workOrderId: string): Promise<StockLevel>` — หักสต็อกพร้อม work order reference ใช้ optimistic lock กัน concurrent deduction
- `receiveStock(partId: string, quantity: number, purchaseOrderId: string): Promise<StockLevel>` — รับสต็อกจาก purchase order เพิ่มปริมาณคงเหลือ
- `getStockLevel(partId: string): Promise<StockLevel>` — คืนปริมาณคงเหลือปัจจุบันและ reorder point ของ part นั้น
- `reserveStock(partId: string, quantity: number, workOrderId: string): Promise<ReservationId>` — จองสต็อกล่วงหน้าก่อน work order จะใช้จริง ดู [[business-logic/synthetic-fleet-maintenance/parts-minimum-stock-policy]]

## State

part: stocked (ปกติ) → reserved (มีการจอง) → consumed (ถูกใช้ไปแล้ว) | below_reorder (ต้องสั่งซื้อ) | out_of_stock (หมด)

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-fleet-maintenance/module-reorder-trigger]] subscribe event `stock.below_reorder_point` จาก service นี้โดยตรง ไม่ต้องให้ [[structure/synthetic-fleet-maintenance/module-work-order-manager]] เป็นตัวกลาง เพราะ reorder ต้องทำงานได้แม้ work order system จะ busy
