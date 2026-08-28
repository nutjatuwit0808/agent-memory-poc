---
layer: structure
tags: [asset-management, assettrack, architecture, overview]
created: 2025-12-09
links:
  - "[[structure/synthetic-asset-management/module-asset-registry]]"
  - "[[structure/synthetic-asset-management/module-license-pool-manager]]"
  - "[[structure/synthetic-asset-management/module-depreciation-engine]]"
  - "[[structure/synthetic-asset-management/module-procurement-handler]]"
  - "[[structure/synthetic-asset-management/module-assignment-tracker]]"
  - "[[structure/synthetic-asset-management/module-disposal-workflow]]"
---

# ภาพรวมสถาปัตยกรรม AssetTrack — ระบบจัดการสินทรัพย์องค์กร

AssetTrack คือแพลตฟอร์มจัดการสินทรัพย์ IT และสินทรัพย์องค์กรสำหรับองค์กรขนาดใหญ่ ครอบคลุมตั้งแต่ฮาร์ดแวร์ (แล็ปท็อป, เซิร์ฟเวอร์, อุปกรณ์เครือข่าย) ไปจนถึง software license, สัญญาบำรุงรักษา, และตารางค่าเสื่อมราคา ระบบทำหน้าที่เป็นแหล่งความจริงเดียวสำหรับทุกสินทรัพย์ที่องค์กรเป็นเจ้าของหรือเช่าใช้

AssetTrack แบ่งออกเป็นหลาย module ย่อยตามหน้าที่ ตั้งแต่การจดทะเบียนสินทรัพย์ใหม่ การติดตามการมอบหมายให้พนักงานหรือสถานที่ ไปจนถึงการจัดการ procurement request และกระบวนการทำลายทิ้งอย่างถูกต้องเมื่อสิ้นอายุการใช้งาน ทีม IT สามารถตรวจสอบสถานะสินทรัพย์ทุกชิ้นได้แบบ real-time ผ่าน dashboard เดียว

## Module หลัก

- **asset-registry** — เป็นแหล่งความจริงหลักสำหรับข้อมูลสินทรัพย์ทุกชิ้นในองค์กร รับผิดชอบการจดทะเบียนส ดู [[structure/synthetic-asset-management/module-asset-registry]]
- **license-pool-manager** — จัดการ pool ของ software license ทุก title ในองค์กร ติดตามจำนวน seat ที่มีทั้งหม ดู [[structure/synthetic-asset-management/module-license-pool-manager]]
- **depreciation-engine** — คำนวณค่าเสื่อมราคาของสินทรัพย์ทุกชิ้นตาม method ที่กำหนดไว้ในนโยบาย (Straight-li ดู [[structure/synthetic-asset-management/module-depreciation-engine]]
- **procurement-handler** — รับและจัดการ procurement request ตั้งแต่ขั้นตอน draft ไปจนถึงการอนุมัติและการสั่ ดู [[structure/synthetic-asset-management/module-procurement-handler]]
- **assignment-tracker** — ติดตามการมอบหมายสินทรัพย์ให้พนักงานหรือสถานที่ และจัดการกระบวนการคืนสินทรัพย์ เป ดู [[structure/synthetic-asset-management/module-assignment-tracker]]
- **disposal-workflow** — จัดการกระบวนการทำลายหรือจำหน่ายสินทรัพย์เมื่อสิ้นอายุการใช้งาน ตรวจสอบว่าทุกขั้น ดู [[structure/synthetic-asset-management/module-disposal-workflow]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-asset-management/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-asset-management/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-asset-management/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-asset-management/database-schema]]
