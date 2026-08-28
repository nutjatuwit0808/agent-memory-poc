---
layer: structure
tags: [supplier, module, core, reference, identifiers]
created: 2026-01-29
links:
  - "[[structure/synthetic-supply-chain/module-supplier-catalog]]"
  - "[[business-logic/synthetic-supply-chain/supplier-blacklisting-policy]]"
  - "[[business-logic/synthetic-supply-chain/dual-source-requirement-policy]]"
---

# supplier-catalog — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด supplier-catalog สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-supply-chain/module-supplier-catalog]])

## Public functions
- `getSupplierProfile(supplierId: string): Promise<SupplierProfile>` — ดึงข้อมูลซัพพลายเออร์รวม blacklist status และ performance score ล่าสุด
- `listEligibleSuppliers(skuId: string): Promise<SupplierProfile[]>` — คืนรายการซัพพลายเออร์ที่ active และไม่ถูก blacklist สำหรับ SKU นั้น
- `recordPerformanceEvent(supplierId: string, event: PerformanceEvent): Promise<void>` — บันทึกเหตุการณ์ที่กระทบ performance score เช่น ส่งสาย, สินค้าไม่ผ่านคุณภาพ
- `blacklistSupplier(supplierId: string, reason: string, reviewDate: string): Promise<void>` — ตั้ง blacklist flag พร้อมกำหนดวันทบทวน ดู [[business-logic/synthetic-supply-chain/supplier-blacklisting-policy]]

## Internal constants
- `BLACKLIST_AUTO_REVIEW_DAYS = 90`
- `PROBATION_THRESHOLD_SCORE = 60`
- `PERFORMANCE_LOOKBACK_DAYS = 180`

## Type

```ts
interface SupplierProfile {
  supplierId: string;
  name: string;
  status: "active" | "probation" | "blacklisted";
  performanceScore: number;
  blacklistReason?: string;
  blacklistReviewDate?: string;
  catalogItems: CatalogItem[];
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง blacklist ที่ [[business-logic/synthetic-supply-chain/supplier-blacklisting-policy]] และ dual-source ที่ [[business-logic/synthetic-supply-chain/dual-source-requirement-policy]]
