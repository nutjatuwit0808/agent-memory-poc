---
layer: structure
tags: [inventory, parts, module, core, reference, identifiers]
created: 2025-09-23
links:
  - "[[structure/synthetic-fleet-maintenance/module-parts-inventory]]"
  - "[[business-logic/synthetic-fleet-maintenance/parts-minimum-stock-policy]]"
---

# parts-inventory — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด parts-inventory สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-fleet-maintenance/module-parts-inventory]])

## Public functions
- `deductStock(partId: string, quantity: number, workOrderId: string): Promise<StockLevel>` — หักสต็อกพร้อม work order reference ใช้ optimistic lock กัน concurrent deduction
- `receiveStock(partId: string, quantity: number, purchaseOrderId: string): Promise<StockLevel>` — รับสต็อกจาก purchase order เพิ่มปริมาณคงเหลือ
- `getStockLevel(partId: string): Promise<StockLevel>` — คืนปริมาณคงเหลือปัจจุบันและ reorder point ของ part นั้น
- `reserveStock(partId: string, quantity: number, workOrderId: string): Promise<ReservationId>` — จองสต็อกล่วงหน้าก่อน work order จะใช้จริง ดู [[business-logic/synthetic-fleet-maintenance/parts-minimum-stock-policy]]

## Internal constants
- `STOCK_OPTIMISTIC_LOCK_RETRY_MAX = 3`
- `RESERVATION_EXPIRY_HOURS = 48`
- `BELOW_REORDER_ALERT_MULTIPLIER = 1.2`

## Type

```ts
interface StockLevel {
  partId: string;
  available: number;
  reserved: number;
  reorderPoint: number;
  reorderQty: number;
  lastUpdated: string;  // ISO 8601
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule ของสต็อกขั้นต่ำที่ [[business-logic/synthetic-fleet-maintenance/parts-minimum-stock-policy]]
