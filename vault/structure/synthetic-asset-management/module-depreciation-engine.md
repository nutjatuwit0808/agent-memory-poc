---
layer: structure
tags: [depreciation, finance, module]
created: 2025-11-16
links:
  - "[[business-logic/synthetic-asset-management/depreciation-method-policy]]"
  - "[[structure/synthetic-asset-management/module-asset-registry]]"
---

# Module: depreciation-engine

คำนวณค่าเสื่อมราคาของสินทรัพย์ทุกชิ้นตาม method ที่กำหนดไว้ในนโยบาย (Straight-line หรือ Double-declining balance) และสร้าง depreciation schedule รายปีโดยอัตโนมัติเมื่อมีสินทรัพย์ใหม่เข้าระบบ แยกออกมาเป็น module เดียวกับที่ทีม finance จะ audit เพื่อให้ตรวจสอบ logic ได้โดยไม่ต้องแตะ module อื่น

## ฟังก์ชันหลัก
- `createSchedule(assetId: string, method: DepreciationMethod, startDate: string): Promise<DepreciationSchedule>` — สร้างตารางค่าเสื่อมราคาตลอดอายุการใช้งาน
- `computeCurrentBookValue(assetId: string, asOf: string): Promise<number>` — คำนวณมูลค่าตามบัญชีของสินทรัพย์ ณ วันที่ระบุ
- `listExpiredSchedules(asOf: string): Promise<DepreciationSchedule[]>` — คืนรายการสินทรัพย์ที่ค่าเสื่อมราคาหมดแล้วตาม schedule
- `recomputeSchedule(assetId: string, correctedStartDate: string): Promise<void>` — คำนวณ schedule ใหม่เมื่อพบว่าวันเริ่มต้นเดิมผิดพลาด ดู [[business-logic/synthetic-asset-management/depreciation-method-policy]]

## ความสัมพันธ์กับ module อื่น

subscribe event `asset.registered` จาก [[structure/synthetic-asset-management/module-asset-registry]] เพื่อสร้าง schedule อัตโนมัติทุกครั้งที่มีสินทรัพย์ใหม่ โดยไม่รอให้ทีม finance trigger เองด้วยมือ ดู [[business-logic/synthetic-asset-management/depreciation-method-policy]] สำหรับกฎว่าสินทรัพย์ประเภทใดใช้ method ใด
