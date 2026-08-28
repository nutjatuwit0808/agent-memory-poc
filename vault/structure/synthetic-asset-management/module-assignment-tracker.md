---
layer: structure
tags: [assignment, module]
created: 2025-11-07
links:
  - "[[structure/synthetic-asset-management/module-asset-registry]]"
  - "[[structure/synthetic-asset-management/module-license-pool-manager]]"
  - "[[business-logic/synthetic-asset-management/depreciation-method-policy]]"
---

# Module: assignment-tracker

ติดตามการมอบหมายสินทรัพย์ให้พนักงานหรือสถานที่ และจัดการกระบวนการคืนสินทรัพย์ เป็น module เดียวที่รู้ว่า "สินทรัพย์ชิ้นนี้อยู่กับใครหรืออยู่ที่ไหน" ณ เวลาปัจจุบัน ทุกการย้ายสินทรัพย์ระหว่างพนักงานหรือสถานที่ต้องผ่าน module นี้เสมอเพื่อให้ประวัติครบถ้วน

## ฟังก์ชันหลัก
- `assignAsset(assetId: string, assigneeId: string, assigneeType: "employee" | "location"): Promise<Assignment>` — มอบหมายสินทรัพย์ให้พนักงานหรือสถานที่ ตรวจสอบว่าสินทรัพย์ไม่ได้ถูก assign อยู่แล้ว
- `returnAsset(assetId: string, returnedBy: string, condition: AssetCondition): Promise<void>` — บันทึกการคืนสินทรัพย์กลับ pool และอัปเดตสถานะ
- `getAssignmentHistory(assetId: string): Promise<Assignment[]>` — ดึงประวัติการมอบหมายทั้งหมดของสินทรัพย์ชิ้นหนึ่ง
- `listUnassignedAssets(category?: AssetCategory): Promise<Asset[]>` — คืนรายการสินทรัพย์ที่ยังไม่ได้มอบหมายและพร้อมใช้งาน

## ความสัมพันธ์กับ module อื่น

ทุกครั้งที่ assign หรือคืนสินทรัพย์จะแจ้ง [[structure/synthetic-asset-management/module-asset-registry]] ให้อัปเดตสถานะด้วย และถ้าสินทรัพย์เป็น software license จะเรียก [[structure/synthetic-asset-management/module-license-pool-manager]] ควบคู่ไปด้วย ดู [[business-logic/synthetic-asset-management/depreciation-method-policy]] สำหรับผลกระทบต่อ depreciation เมื่อสินทรัพย์ถูกย้ายสถานที่
