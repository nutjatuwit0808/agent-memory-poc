---
layer: structure
tags: [registry, module, core]
created: 2025-11-23
links:
  - "[[business-logic/synthetic-asset-management/asset-minimum-useful-life-policy]]"
  - "[[structure/synthetic-asset-management/module-assignment-tracker]]"
---

# Module: asset-registry

เป็นแหล่งความจริงหลักสำหรับข้อมูลสินทรัพย์ทุกชิ้นในองค์กร รับผิดชอบการจดทะเบียนสินทรัพย์ใหม่ อัปเดตสถานะ และเก็บประวัติการเปลี่ยนแปลงทั้งหมด ทุก module ที่ต้องรู้ว่าสินทรัพย์ชิ้นไหนมีอยู่หรือสถานะปัจจุบันเป็นอะไรต้อง query ผ่าน module นี้เท่านั้น

## ฟังก์ชันหลัก
- `registerAsset(data: AssetInput): Promise<Asset>` — จดทะเบียนสินทรัพย์ใหม่เข้าระบบ คืน asset record พร้อม asset_id ที่ generate แล้ว
- `updateAssetStatus(assetId: string, status: AssetStatus, reason: string): Promise<void>` — เปลี่ยนสถานะสินทรัพย์และบันทึกเหตุผลลง history
- `lookupAsset(assetId: string): Promise<Asset | null>` — ดึงข้อมูลสินทรัพย์ปัจจุบัน คืน null ถ้าไม่พบ
- `searchAssets(filter: AssetFilter): Promise<Asset[]>` — ค้นหาสินทรัพย์ตาม filter เช่น ประเภท, ตำแหน่ง, สถานะ

## State

draft → active → assigned | in_maintenance → returned → flagged_for_disposal → disposed — ดู [[business-logic/synthetic-asset-management/asset-minimum-useful-life-policy]] สำหรับเงื่อนไขการเปลี่ยนสถานะแต่ละขั้น

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-asset-management/module-assignment-tracker]] เรียก `updateAssetStatus` ทุกครั้งที่มีการมอบหมายหรือคืนสินทรัพย์ แต่ asset-registry ไม่รู้จัก concept ของ "พนักงาน" เลย รู้แค่ว่าสินทรัพย์มีสถานะอะไร การ map สินทรัพย์กับพนักงานเป็นหน้าที่ของ assignment-tracker แต่ผู้เดียว
