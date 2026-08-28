---
layer: structure
tags: [license, module, core, reference, identifiers]
created: 2026-05-30
links:
  - "[[structure/synthetic-asset-management/module-license-pool-manager]]"
  - "[[business-logic/synthetic-asset-management/license-overallocation-policy]]"
---

# license-pool-manager — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด license-pool-manager สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-asset-management/module-license-pool-manager]])

## Public functions
- `allocateLicense(productId: string, userId: string): Promise<LicenseAllocation>` — จ่าย license seat ให้ผู้ใช้ ตรวจสอบก่อนว่า pool มี seat เหลือ
- `revokeLicense(allocationId: string): Promise<void>` — คืน license seat กลับ pool เมื่อผู้ใช้ไม่ต้องการแล้ว
- `getPoolStatus(productId: string): Promise<PoolStatus>` — คืนจำนวน seat ทั้งหมด ที่ใช้ไป และที่เหลือ พร้อม threshold status
- `syncLicenseCount(productId: string, vendorCount: number): Promise<void>` — อัปเดตจำนวน seat จริงจาก vendor portal เพื่อป้องกัน count drift

## Internal constants
- `OVERALLOCATION_WARNING_THRESHOLD_PCT = 90`
- `OVERALLOCATION_HARD_LIMIT_PCT = 100`
- `SYNC_INTERVAL_HOURS = 24`

## Type

```ts
interface PoolStatus {
  productId: string;
  totalSeats: number;
  usedSeats: number;
  availableSeats: number;
  thresholdStatus: "ok" | "warning" | "overallocated";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องเกณฑ์และผลที่เกิดขึ้นเมื่อ overallocate ที่ [[business-logic/synthetic-asset-management/license-overallocation-policy]]
