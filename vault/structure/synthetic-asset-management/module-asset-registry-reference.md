---
layer: structure
tags: [registry, module, core, reference, identifiers]
created: 2026-08-19
links:
  - "[[structure/synthetic-asset-management/module-asset-registry]]"
  - "[[business-logic/synthetic-asset-management/asset-minimum-useful-life-policy]]"
---

# asset-registry — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด asset-registry สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-asset-management/module-asset-registry]])

## Public functions
- `registerAsset(data: AssetInput): Promise<Asset>` — จดทะเบียนสินทรัพย์ใหม่เข้าระบบ คืน asset record พร้อม asset_id ที่ generate แล้ว
- `updateAssetStatus(assetId: string, status: AssetStatus, reason: string): Promise<void>` — เปลี่ยนสถานะสินทรัพย์และบันทึกเหตุผลลง history
- `lookupAsset(assetId: string): Promise<Asset | null>` — ดึงข้อมูลสินทรัพย์ปัจจุบัน คืน null ถ้าไม่พบ
- `searchAssets(filter: AssetFilter): Promise<Asset[]>` — ค้นหาสินทรัพย์ตาม filter เช่น ประเภท, ตำแหน่ง, สถานะ

## Internal constants
- `ASSET_ID_PREFIX = "AT"`
- `MAX_SERIAL_NUMBER_LENGTH = 64`
- `HISTORY_RETENTION_YEARS = 10`

## Type

```ts
interface Asset {
  assetId: string;
  name: string;
  category: "hardware" | "software" | "network" | "peripheral";
  status: AssetStatus;
  serialNumber?: string;
  purchaseDate: string;
  location?: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-asset-management/asset-minimum-useful-life-policy]]
