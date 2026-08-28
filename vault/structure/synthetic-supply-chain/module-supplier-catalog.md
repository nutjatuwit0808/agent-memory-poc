---
layer: structure
tags: [supplier, module, core]
created: 2026-02-04
links:
  - "[[business-logic/synthetic-supply-chain/supplier-blacklisting-policy]]"
  - "[[structure/synthetic-supply-chain/module-purchase-order-engine]]"
  - "[[structure/synthetic-supply-chain/module-replenishment-trigger]]"
  - "[[business-logic/synthetic-supply-chain/dual-source-requirement-policy]]"
---

# Module: supplier-catalog

เก็บข้อมูลซัพพลายเออร์ทั้งหมด ครอบคลุมรายการสินค้าที่ซัพพลายเออร์แต่ละรายจัดหาได้ ราคา MOQ lead time ที่ตกลงกัน และสถานะ blacklist ทุก service ที่ต้องรู้ข้อมูลซัพพลายเออร์ต้อง query ผ่านตัวนี้เท่านั้น ไม่มี service ไหนเก็บข้อมูลซัพพลายเออร์ซ้ำเอง

## ฟังก์ชันหลัก
- `getSupplierProfile(supplierId: string): Promise<SupplierProfile>` — ดึงข้อมูลซัพพลายเออร์รวม blacklist status และ performance score ล่าสุด
- `listEligibleSuppliers(skuId: string): Promise<SupplierProfile[]>` — คืนรายการซัพพลายเออร์ที่ active และไม่ถูก blacklist สำหรับ SKU นั้น
- `recordPerformanceEvent(supplierId: string, event: PerformanceEvent): Promise<void>` — บันทึกเหตุการณ์ที่กระทบ performance score เช่น ส่งสาย, สินค้าไม่ผ่านคุณภาพ
- `blacklistSupplier(supplierId: string, reason: string, reviewDate: string): Promise<void>` — ตั้ง blacklist flag พร้อมกำหนดวันทบทวน ดู [[business-logic/synthetic-supply-chain/supplier-blacklisting-policy]]

## State

active → probation (performance ต่ำ) → blacklisted | reinstated — วงจรนี้กำหนดโดย [[business-logic/synthetic-supply-chain/supplier-blacklisting-policy]]

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-supply-chain/module-purchase-order-engine]] เรียก `listEligibleSuppliers` ก่อนสร้าง PO ทุกครั้ง และ [[structure/synthetic-supply-chain/module-replenishment-trigger]] ใช้ข้อมูลนี้เพื่อเลือกซัพพลายเออร์สำรองเมื่อต้องการ dual-source ดู [[business-logic/synthetic-supply-chain/dual-source-requirement-policy]]
