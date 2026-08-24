---
layer: structure
tags: [search, module, core, reference, identifiers]
created: 2025-12-09
links:
  - "[[structure/synthetic-travel-booking/module-availability-search]]"
  - "[[business-logic/synthetic-travel-booking/price-cache-staleness-policy]]"
---

# availability-search — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด availability-search สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-travel-booking/module-availability-search]])

## Public functions
- `searchAvailability(criteria: SearchCriteria): Promise<AvailabilityResult[]>` — จุดเข้าเดียวของการค้นหา กระจาย query ไปหลายซัพพลายเออร์พร้อมกัน
- `rankResults(results: AvailabilityResult[], prefs: RankingPrefs): AvailabilityResult[]` — จัดอันดับผลลัพธ์ตามราคา/ระยะทาง/rating ผสมกัน
- `excludeDegradedSuppliers(supplierIds: string[]): void` — ตัดซัพพลายเออร์ที่ถูก mark degraded ออกจากรอบค้นหาถัดไปชั่วคราว

## Internal constants
- `SEARCH_TIMEOUT_MS = 3000`
- `MAX_SUPPLIERS_PER_QUERY = 12`
- `DEFAULT_RESULT_LIMIT = 40`

## Type

```ts
interface AvailabilityResult {
  offerId: string;
  supplierId: string;
  priceMinor: number;
  currency: string;
  roomsLeft: number | null;
  cacheAgeMs: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่อง cache staleness ที่ [[business-logic/synthetic-travel-booking/price-cache-staleness-policy]]
