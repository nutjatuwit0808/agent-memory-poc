---
layer: structure
tags: [receiving, module, core]
created: 2026-07-29
links:
  - "[[structure/synthetic-supply-chain/module-quality-inspection-gate]]"
  - "[[business-logic/synthetic-supply-chain/quality-rejection-policy]]"
  - "[[structure/synthetic-supply-chain/module-purchase-order-engine]]"
  - "[[structure/synthetic-supply-chain/service-boundaries]]"
---

# Module: goods-receipt-processor

จัดการกระบวนการรับสินค้าจากซัพพลายเออร์ทั้งหมด ตั้งแต่บันทึกการมาถึง ส่งต่อให้ตรวจสอบคุณภาพ อัปเดตสถานะ PO และเข้าสต็อก เป็น service เดียวที่เห็นข้อมูลทั้ง PO และผลการตรวจสอบคุณภาพในเวลาเดียวกัน ทำให้เป็นจุดตัดสินใจหลักว่าสินค้าที่มาถึงจะเข้าสต็อกหรือถูกปฏิเสธ

## ฟังก์ชันหลัก
- `registerArrival(poId: string, shipmentId: string, receivedItems: ReceivedItem[]): Promise<ReceiptRecord>` — บันทึกการมาถึงของสินค้า เปรียบเทียบกับ PO line item ที่คาดหวัง
- `submitForInspection(receiptId: string): Promise<InspectionRequest>` — ส่งสินค้าที่รับมาให้ [[structure/synthetic-supply-chain/module-quality-inspection-gate]] ตรวจสอบ
- `processInspectionResult(receiptId: string, result: InspectionResult): Promise<void>` — อัปเดตสถานะ receipt และ PO ตามผลการตรวจสอบ รับหรือปฏิเสธสินค้า
- `handlePartialShipment(poId: string, receivedQty: Record<string, number>): Promise<void>` — จัดการกรณีสินค้ามาไม่ครบ PO บันทึก outstanding quantity

## State

arrived → inspecting → accepted | rejected | partially_accepted — ดู [[business-logic/synthetic-supply-chain/quality-rejection-policy]] สำหรับเกณฑ์การปฏิเสธสินค้า

## ความสัมพันธ์กับ module อื่น

เป็น service เดียวที่ cross-query ทั้ง [[structure/synthetic-supply-chain/module-purchase-order-engine]] และ [[structure/synthetic-supply-chain/module-quality-inspection-gate]] (ดู [[structure/synthetic-supply-chain/service-boundaries]]) การออกแบบนี้ตั้งใจเพื่อให้ logic การรับสินค้าอยู่ในที่เดียวแทนที่จะกระจายข้ามสอง service
