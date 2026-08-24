---
layer: structure
tags: [inventory, supplier, module]
created: 2026-03-08
links:
  - "[[structure/synthetic-travel-booking/service-boundaries]]"
  - "[[structure/synthetic-travel-booking/module-price-cache]]"
---

# Module: supplier-sync

sync จำนวนห้องว่างจริงจากซัพพลายเออร์แต่ละรายเข้ามาเก็บเป็น snapshot ภายใน ทำงานเป็น background job เป็นหลัก ความถี่การ sync แตกต่างกันตามซัพพลายเออร์เพราะบางรายให้ webhook แบบ real-time บางรายต้อง poll เอง

## ฟังก์ชันหลัก
- `syncSupplierInventory(supplierId: string): Promise<SyncResult>` — ดึงจำนวนห้องว่างล่าสุดจากซัพพลายเออร์มาบันทึกเป็น snapshot
- `reconcileDiscrepancy(supplierId: string, offerId: string): Promise<void>` — เทียบ snapshot กับผลลัพธ์การจองจริงเพื่อหาความคลาดเคลื่อน
- `markSupplierDegraded(supplierId: string, reason: string): Promise<void>` — ตัดซัพพลายเออร์ออกจากผลค้นหาชั่วคราวเมื่อ sync ล้มเหลวต่อเนื่อง

## ความสัมพันธ์กับ module อื่น

ไม่รู้จัก concept ของ "ราคา" เลย (ดู [[structure/synthetic-travel-booking/service-boundaries]]) — เมื่อ sync เสร็จจะ publish `inventory.sync_completed` ให้ [[structure/synthetic-travel-booking/module-price-cache]] ไป invalidate เอง แทนที่จะเขียนราคาตรงๆ เพื่อคุมความรับผิดชอบให้ชัดเจนว่าใครเป็นเจ้าของอะไร
