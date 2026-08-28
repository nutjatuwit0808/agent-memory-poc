---
layer: structure
tags: [asset-management, assettrack, boundaries]
created: 2026-04-24
links:
  - "[[structure/synthetic-asset-management/module-asset-registry]]"
  - "[[structure/synthetic-asset-management/module-depreciation-engine]]"
  - "[[structure/synthetic-asset-management/module-procurement-handler]]"
---

# Service Boundaries

แต่ละ module มีฐานข้อมูลของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-asset-management/module-asset-registry]] เป็นเจ้าของข้อมูลหลักของสินทรัพย์ (ชื่อ, ประเภท, serial number, สถานะปัจจุบัน) ส่วน [[structure/synthetic-asset-management/module-depreciation-engine]] เป็นเจ้าของตารางค่าเสื่อมราคาและประวัติการคำนวณ ทั้งสองไม่ share ตารางกันโดยตรง

[[structure/synthetic-asset-management/module-procurement-handler]] เป็น module เดียวที่สามารถสร้าง asset record ใหม่ใน [[structure/synthetic-asset-management/module-asset-registry]] ได้ผ่าน internal API — การเพิ่มสินทรัพย์โดยตรงผ่านช่องทางอื่นถือว่าผิดหลักและจะทำให้ข้อมูล procurement history ขาดหาย
