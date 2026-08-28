---
layer: structure
tags: [quality, module]
created: 2026-01-20
links:
  - "[[business-logic/synthetic-supply-chain/quality-rejection-policy]]"
  - "[[structure/synthetic-supply-chain/module-goods-receipt-processor]]"
  - "[[structure/synthetic-supply-chain/module-replenishment-trigger]]"
  - "[[structure/synthetic-supply-chain/module-supplier-catalog]]"
---

# Module: quality-inspection-gate

ดำเนินการตรวจสอบคุณภาพสินค้าขาเข้าตาม specification ที่กำหนดต่อ SKU ระบบรองรับทั้งการตรวจสอบแบบ sampling (สุ่มตัวอย่างจาก lot) และ full inspection (ตรวจทุกชิ้น) ขึ้นอยู่กับ risk profile ของสินค้านั้น บันทึกผลการตรวจสอบทุก lot ไม่ลบทิ้งเพื่อใช้วิเคราะห์ supplier quality trend

## ฟังก์ชันหลัก
- `createInspectionRequest(receiptId: string, skuId: string, qty: number): Promise<InspectionRequest>` — สร้าง inspection request พร้อมกำหนด sampling plan ตาม AQL ของ SKU
- `recordInspectionResult(inspectionId: string, result: QualityResult): Promise<void>` — บันทึกผลตรวจสอบแต่ละ lot พร้อม defect detail
- `computeRejectionDecision(inspectionId: string): Promise<RejectionDecision>` — คำนวณว่า lot นี้ผ่าน/ปฏิเสธ/ต้องตรวจเพิ่มตาม [[business-logic/synthetic-supply-chain/quality-rejection-policy]]
- `getSupplierQualityTrend(supplierId: string, lookbackDays: number): Promise<QualityTrend>` — คืนสถิติคุณภาพของซัพพลายเออร์นั้นย้อนหลัง N วัน

## ความสัมพันธ์กับ module อื่น

ผลการตรวจสอบถูก publish เป็น event `inspection.passed` หรือ `inspection.rejected` ให้ [[structure/synthetic-supply-chain/module-goods-receipt-processor]] และ [[structure/synthetic-supply-chain/module-replenishment-trigger]] ใช้ต่อ ข้อมูล quality trend ยังถูกส่งไปยัง [[structure/synthetic-supply-chain/module-supplier-catalog]] เพื่ออัปเดต performance score ของซัพพลายเออร์ด้วย
