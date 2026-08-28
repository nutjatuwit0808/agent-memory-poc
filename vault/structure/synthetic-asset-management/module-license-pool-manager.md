---
layer: structure
tags: [license, module, core]
created: 2025-09-02
links:
  - "[[business-logic/synthetic-asset-management/license-overallocation-policy]]"
  - "[[structure/synthetic-asset-management/module-assignment-tracker]]"
---

# Module: license-pool-manager

จัดการ pool ของ software license ทุก title ในองค์กร ติดตามจำนวน seat ที่มีทั้งหมดและที่ถูกใช้ไปอยู่ในปัจจุบัน แจ้งเตือนเมื่อใกล้ถึงเกณฑ์ overallocation และป้องกันไม่ให้มีการ assign license เกินจำนวนที่มี แยกออกมาจาก asset-registry เพราะ license มี lifecycle และกฎการนับที่แตกต่างจากสินทรัพย์ทางกายภาพอย่างสิ้นเชิง

## ฟังก์ชันหลัก
- `allocateLicense(productId: string, userId: string): Promise<LicenseAllocation>` — จ่าย license seat ให้ผู้ใช้ ตรวจสอบก่อนว่า pool มี seat เหลือ
- `revokeLicense(allocationId: string): Promise<void>` — คืน license seat กลับ pool เมื่อผู้ใช้ไม่ต้องการแล้ว
- `getPoolStatus(productId: string): Promise<PoolStatus>` — คืนจำนวน seat ทั้งหมด ที่ใช้ไป และที่เหลือ พร้อม threshold status
- `syncLicenseCount(productId: string, vendorCount: number): Promise<void>` — อัปเดตจำนวน seat จริงจาก vendor portal เพื่อป้องกัน count drift

## State

pool_created → seat_allocated (แต่ละ seat) | seat_available — ดู [[business-logic/synthetic-asset-management/license-overallocation-policy]] สำหรับเกณฑ์ที่ trigger alert

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-asset-management/module-assignment-tracker]] เรียก `allocateLicense` ทุกครั้งที่มอบหมาย software asset ให้พนักงาน เพื่อให้แน่ใจว่าการ assign ทางกายภาพและการนับ license ตรงกันเสมอ ดู [[business-logic/synthetic-asset-management/license-overallocation-policy]] สำหรับกฎเรื่องเกณฑ์เตือน
