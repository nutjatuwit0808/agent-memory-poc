---
layer: structure
tags: [replenishment, module, core, reference, identifiers]
created: 2026-06-04
links:
  - "[[structure/synthetic-inventory-forecasting/module-replenishment-recommender]]"
  - "[[business-logic/synthetic-inventory-forecasting/forecast-override-policy]]"
---

# replenishment-recommender — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด replenishment-recommender สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-inventory-forecasting/module-replenishment-recommender]])

## Public functions
- `computeReplenishmentQty(skuId: string, storeId: string): Promise<ReplenishmentRecommendation>` — คำนวณจำนวนที่ควรเติมจาก forecast + safety stock - inventory position ปัจจุบัน
- `generatePurchaseOrderDraft(supplierId: string, skuIds: string[]): Promise<string>` — รวม recommendation หลาย SKU ของ supplier เดียวกันเป็น draft PO ใบเดียว คืน draftId
- `applyAnalystOverride(skuId: string, storeId: string, qty: number, analystId: string): Promise<void>` — ให้ analyst แก้จำนวนที่ระบบแนะนำด้วยมือ พร้อมบันทึกว่าใครแก้

## Internal constants
- `DEFAULT_SAFETY_STOCK_DAYS = 7`
- `LEAD_TIME_BUFFER_DAYS = 2`
- `MAX_ORDER_QTY_MULTIPLIER = 3`

## Type

```ts
interface ReplenishmentRecommendation {
  skuId: string;
  storeId: string;
  recommendedQty: number;
  source: "system" | "analyst_override";
  status: "draft" | "reviewed" | "approved" | "sent_to_supplier";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง override ที่ [[business-logic/synthetic-inventory-forecasting/forecast-override-policy]]
