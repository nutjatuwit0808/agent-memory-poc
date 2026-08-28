---
layer: structure
tags: [reorder, procurement, module]
created: 2026-03-07
links:
  - "[[business-logic/synthetic-fleet-maintenance/vendor-approval-non-stocked-parts-policy]]"
  - "[[support-cases/synthetic-fleet-maintenance/case-4790]]"
---

# Module: reorder-trigger

รับ event เมื่อสต็อกอะไหล่ต่ำกว่า reorder point แล้วสร้าง purchase request ไปยังระบบจัดซื้อ ตรวจสอบก่อนว่ามี purchase request ค้างอยู่สำหรับ part นั้นแล้วหรือไม่ เพื่อกัน duplicate order แยกออกมาเพราะ procurement logic มีขั้นตอนการอนุมัติ vendor และ lead time ของตัวเอง

## ฟังก์ชันหลัก
- `checkAndTriggerReorder(partId: string, currentStock: number): Promise<PurchaseRequestId | null>` — ตรวจสต็อกและสร้าง purchase request ถ้าต่ำกว่า reorder point และยังไม่มี request ค้างอยู่
- `approvePurchaseRequest(requestId: string, approvedBy: string, vendorId: string): Promise<void>` — อนุมัติ purchase request และเลือก vendor ดู [[business-logic/synthetic-fleet-maintenance/vendor-approval-non-stocked-parts-policy]]
- `recordDeliveryExpected(requestId: string, expectedDate: string): Promise<void>` — บันทึกวันที่คาดว่าของจะมาถึง ใช้แจ้งเตือนช่างถ้ายังต้องรอ
- `listPendingReorders(partIds?: string[]): Promise<PurchaseRequest[]>` — ดู purchase request ที่ยังค้างอยู่ กรองตาม part ได้

## ความสัมพันธ์กับ module อื่น

ตรวจสอบ pending request ก่อนสร้างใหม่เสมอเพื่อกัน duplicate ดู [[support-cases/synthetic-fleet-maintenance/case-4790]] สำหรับกรณีที่เกิดขึ้นจริง parts ที่ต้องสั่งจาก vendor พิเศษต้องผ่านกระบวนการอนุมัติตาม [[business-logic/synthetic-fleet-maintenance/vendor-approval-non-stocked-parts-policy]]
