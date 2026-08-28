---
layer: structure
tags: [purchase-order, module, core]
created: 2026-03-30
links:
  - "[[business-logic/synthetic-supply-chain/lead-time-sla-policy]]"
  - "[[structure/synthetic-supply-chain/module-quality-inspection-gate]]"
  - "[[structure/synthetic-supply-chain/module-goods-receipt-processor]]"
---

# Module: purchase-order-engine

รับผิดชอบ lifecycle ของ Purchase Order ทั้งหมดตั้งแต่สร้างจนถึงปิด PO ครอบคลุมการสร้างจาก requisition, การส่งให้ซัพพลายเออร์ยืนยัน, การติดตามสถานะจัดส่ง, และการปิด PO เมื่อรับสินค้าครบ แยกออกมาเป็น service อิสระตั้งแต่ปี 2024 เพราะ PO lifecycle มีขั้นตอนซับซ้อนที่ไม่ควรปนกับ logic การรับสินค้า

## ฟังก์ชันหลัก
- `createPurchaseOrder(supplierId: string, lineItems: LineItem[]): Promise<PurchaseOrder>` — สร้าง PO ใหม่ ตรวจสอบ MOQ และ blacklist ก่อนยืนยัน
- `confirmOrder(poId: string, supplierConfirmation: SupplierConfirm): Promise<void>` — บันทึกการยืนยันของซัพพลายเออร์รวม lead time จริงที่แจ้งมา
- `amendOrder(poId: string, amendment: POAmendment): Promise<void>` — แก้ไข PO ที่ยืนยันแล้ว บันทึก version history ทุกครั้ง
- `closePurchaseOrder(poId: string, closureReason: string): Promise<void>` — ปิด PO เมื่อรับสินค้าครบหรือยกเลิก พร้อม audit log

## State

draft → pending_supplier → confirmed → in_transit → partially_received → completed | cancelled — ดู [[business-logic/synthetic-supply-chain/lead-time-sla-policy]] สำหรับเงื่อนไข SLA แต่ละช่วง

## ความสัมพันธ์กับ module อื่น

ไม่คุยกับ [[structure/synthetic-supply-chain/module-quality-inspection-gate]] โดยตรง — เมื่อสินค้าถูกปฏิเสธจากการตรวจสอบ จะเป็น [[structure/synthetic-supply-chain/module-goods-receipt-processor]] ที่อัปเดตสถานะ PO line item แทน เพื่อรักษาหลัก separation of concerns
