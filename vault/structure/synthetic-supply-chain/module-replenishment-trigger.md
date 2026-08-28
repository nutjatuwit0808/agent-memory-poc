---
layer: structure
tags: [replenishment, module]
created: 2026-06-15
links:
  - "[[structure/synthetic-supply-chain/module-purchase-order-engine]]"
  - "[[structure/synthetic-supply-chain/module-quality-inspection-gate]]"
  - "[[structure/synthetic-supply-chain/queue-architecture]]"
  - "[[business-logic/synthetic-supply-chain/replenishment-threshold-policy]]"
---

# Module: replenishment-trigger

ตรวจสอบระดับสต็อกเทียบกับ reorder point ที่กำหนดต่อ SKU และสร้าง purchase order ใหม่อัตโนมัติเมื่อสต็อกต่ำกว่าเกณฑ์ แยกออกมาเป็น service อิสระเพราะ replenishment logic มี parameter ที่ต้องปรับบ่อย เช่น reorder point, economic order quantity, และการเลือก preferred supplier ที่ไม่ควรปนกับ PO lifecycle

## ฟังก์ชันหลัก
- `evaluateReplenishmentNeed(skuId: string): Promise<ReplenishmentDecision>` — ประเมินว่า SKU นี้ควรสร้าง PO ใหม่ คืน recommended qty และ supplier
- `triggerReplenishment(skuId: string, qty: number, supplierId: string): Promise<string>` — สร้าง PO ใหม่ผ่าน [[structure/synthetic-supply-chain/module-purchase-order-engine]] และ log trigger event
- `updateReorderConfig(skuId: string, config: ReorderConfig): Promise<void>` — อัปเดต reorder point และ EOQ ของ SKU โดยต้องมี reason บันทึกทุกครั้ง
- `getReplenishmentForecast(skuId: string, days: number): Promise<Forecast>` — คาดการณ์ว่า SKU นี้จะถึง reorder point เมื่อไหร่จากอัตราการใช้งานปัจจุบัน

## ความสัมพันธ์กับ module อื่น

subscribe event `inspection.passed` จาก [[structure/synthetic-supply-chain/module-quality-inspection-gate]] เพื่อนับปริมาณสินค้าที่เข้าสต็อกจริง ไม่ใช่ใช้ตัวเลขจาก PO (ดู [[structure/synthetic-supply-chain/queue-architecture]]) เพราะสินค้าที่ถูกปฏิเสธไม่ควรนับเป็นสต็อกที่มีอยู่ ดู [[business-logic/synthetic-supply-chain/replenishment-threshold-policy]] สำหรับเกณฑ์การ trigger
