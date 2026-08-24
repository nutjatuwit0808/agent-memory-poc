---
layer: structure
tags: [replenishment, module, core]
created: 2025-10-17
links:
  - "[[business-logic/synthetic-inventory-forecasting/replenishment-approval-policy]]"
  - "[[structure/synthetic-inventory-forecasting/module-seasonality-adjuster]]"
  - "[[structure/synthetic-inventory-forecasting/service-boundaries]]"
  - "[[business-logic/synthetic-inventory-forecasting/backfill-policy]]"
---

# Module: replenishment-recommender

แปลงผลพยากรณ์ที่ปรับฤดูกาลแล้วรวมกับ inventory position ปัจจุบันจาก ERP ให้เป็นคำแนะนำจำนวนเติมสินค้า (purchase order draft) โดยคำนวณ safety stock และ lead time buffer ต่อ SKU เป็นรายตัว

## ฟังก์ชันหลัก
- `computeReplenishmentQty(skuId: string, storeId: string): Promise<ReplenishmentRecommendation>` — คำนวณจำนวนที่ควรเติมจาก forecast + safety stock - inventory position ปัจจุบัน
- `generatePurchaseOrderDraft(supplierId: string, skuIds: string[]): Promise<string>` — รวม recommendation หลาย SKU ของ supplier เดียวกันเป็น draft PO ใบเดียว คืน draftId
- `applyAnalystOverride(skuId: string, storeId: string, qty: number, analystId: string): Promise<void>` — ให้ analyst แก้จำนวนที่ระบบแนะนำด้วยมือ พร้อมบันทึกว่าใครแก้

## State

draft → reviewed → approved → sent_to_supplier — ดู [[business-logic/synthetic-inventory-forecasting/replenishment-approval-policy]] สำหรับเงื่อนไขว่าเมื่อไหร่ต้องมีคนอนุมัติก่อนส่ง

## ความสัมพันธ์กับ module อื่น

เป็น service เดียวที่ query ข้าม [[structure/synthetic-inventory-forecasting/module-seasonality-adjuster]] และข้อมูล inventory position จาก ERP พร้อมกันได้ (ข้อยกเว้นที่ตั้งใจ ดู [[structure/synthetic-inventory-forecasting/service-boundaries]]) — ค่า override จาก analyst ผ่าน `applyAnalystOverride` ต้องไม่ถูกงานอื่นทับโดยไม่ผ่านการตรวจสอบ ดู [[business-logic/synthetic-inventory-forecasting/backfill-policy]]
