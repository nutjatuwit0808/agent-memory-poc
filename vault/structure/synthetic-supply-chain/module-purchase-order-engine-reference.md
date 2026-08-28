---
layer: structure
tags: [purchase-order, module, core, reference, identifiers]
created: 2025-11-17
links:
  - "[[structure/synthetic-supply-chain/module-purchase-order-engine]]"
  - "[[business-logic/synthetic-supply-chain/lead-time-sla-policy]]"
  - "[[business-logic/synthetic-supply-chain/minimum-order-quantity-policy]]"
---

# purchase-order-engine — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด purchase-order-engine สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-supply-chain/module-purchase-order-engine]])

## Public functions
- `createPurchaseOrder(supplierId: string, lineItems: LineItem[]): Promise<PurchaseOrder>` — สร้าง PO ใหม่ ตรวจสอบ MOQ และ blacklist ก่อนยืนยัน
- `confirmOrder(poId: string, supplierConfirmation: SupplierConfirm): Promise<void>` — บันทึกการยืนยันของซัพพลายเออร์รวม lead time จริงที่แจ้งมา
- `amendOrder(poId: string, amendment: POAmendment): Promise<void>` — แก้ไข PO ที่ยืนยันแล้ว บันทึก version history ทุกครั้ง
- `closePurchaseOrder(poId: string, closureReason: string): Promise<void>` — ปิด PO เมื่อรับสินค้าครบหรือยกเลิก พร้อม audit log

## Internal constants
- `PO_DRAFT_EXPIRY_DAYS = 7`
- `MAX_LINE_ITEMS_PER_PO = 200`
- `SUPPLIER_CONFIRM_TIMEOUT_HOURS = 48`

## Type

```ts
interface PurchaseOrder {
  poId: string;
  supplierId: string;
  status: "draft" | "pending_supplier" | "confirmed" | "in_transit" | "partially_received" | "completed" | "cancelled";
  lineItems: LineItem[];
  confirmedLeadTimeDays?: number;
  createdAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-supply-chain/lead-time-sla-policy]] และ [[business-logic/synthetic-supply-chain/minimum-order-quantity-policy]]
