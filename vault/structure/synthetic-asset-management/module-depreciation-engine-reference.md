---
layer: structure
tags: [depreciation, finance, module, reference, identifiers]
created: 2025-11-28
links:
  - "[[structure/synthetic-asset-management/module-depreciation-engine]]"
  - "[[business-logic/synthetic-asset-management/depreciation-method-policy]]"
---

# depreciation-engine — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด depreciation-engine สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-asset-management/module-depreciation-engine]])

## Public functions
- `createSchedule(assetId: string, method: DepreciationMethod, startDate: string): Promise<DepreciationSchedule>` — สร้างตารางค่าเสื่อมราคาตลอดอายุการใช้งาน
- `computeCurrentBookValue(assetId: string, asOf: string): Promise<number>` — คำนวณมูลค่าตามบัญชีของสินทรัพย์ ณ วันที่ระบุ
- `listExpiredSchedules(asOf: string): Promise<DepreciationSchedule[]>` — คืนรายการสินทรัพย์ที่ค่าเสื่อมราคาหมดแล้วตาม schedule
- `recomputeSchedule(assetId: string, correctedStartDate: string): Promise<void>` — คำนวณ schedule ใหม่เมื่อพบว่าวันเริ่มต้นเดิมผิดพลาด ดู [[business-logic/synthetic-asset-management/depreciation-method-policy]]

## Internal constants
- `DEFAULT_USEFUL_LIFE_YEARS_HARDWARE = 3`
- `DEFAULT_USEFUL_LIFE_YEARS_NETWORK = 5`
- `RESIDUAL_VALUE_PCT = 10`

## Type

```ts
interface DepreciationSchedule {
  assetId: string;
  method: "straight-line" | "double-declining";
  startDate: string;
  usefulLifeYears: number;
  annualEntries: { year: number; depreciation: number; bookValue: number }[];
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการเลือก method และข้อยกเว้นที่ [[business-logic/synthetic-asset-management/depreciation-method-policy]]
