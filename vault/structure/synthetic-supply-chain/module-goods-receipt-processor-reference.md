---
layer: structure
tags: [receiving, module, core, reference, identifiers]
created: 2026-01-28
links:
  - "[[structure/synthetic-supply-chain/module-goods-receipt-processor]]"
  - "[[structure/synthetic-supply-chain/module-quality-inspection-gate]]"
  - "[[business-logic/synthetic-supply-chain/quality-rejection-policy]]"
  - "[[business-logic/synthetic-supply-chain/goods-receipt-discrepancy-policy]]"
---

# goods-receipt-processor — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด goods-receipt-processor สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-supply-chain/module-goods-receipt-processor]])

## Public functions
- `registerArrival(poId: string, shipmentId: string, receivedItems: ReceivedItem[]): Promise<ReceiptRecord>` — บันทึกการมาถึงของสินค้า เปรียบเทียบกับ PO line item ที่คาดหวัง
- `submitForInspection(receiptId: string): Promise<InspectionRequest>` — ส่งสินค้าที่รับมาให้ [[structure/synthetic-supply-chain/module-quality-inspection-gate]] ตรวจสอบ
- `processInspectionResult(receiptId: string, result: InspectionResult): Promise<void>` — อัปเดตสถานะ receipt และ PO ตามผลการตรวจสอบ รับหรือปฏิเสธสินค้า
- `handlePartialShipment(poId: string, receivedQty: Record<string, number>): Promise<void>` — จัดการกรณีสินค้ามาไม่ครบ PO บันทึก outstanding quantity

## Internal constants
- `PARTIAL_RECEIPT_TOLERANCE_PCT = 5`
- `INSPECTION_SUBMIT_TIMEOUT_HOURS = 24`
- `MAX_RECEIPT_DISCREPANCY_QTY = 10`

## Type

```ts
interface ReceiptRecord {
  receiptId: string;
  poId: string;
  shipmentId: string;
  status: "arrived" | "inspecting" | "accepted" | "rejected" | "partially_accepted";
  receivedItems: ReceivedItem[];
  discrepancyNotes?: string;
  arrivedAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการปฏิเสธสินค้าที่ [[business-logic/synthetic-supply-chain/quality-rejection-policy]] และการรับสินค้าไม่ครบที่ [[business-logic/synthetic-supply-chain/goods-receipt-discrepancy-policy]]
