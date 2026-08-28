---
layer: structure
tags: [procurement, module]
created: 2026-03-08
links:
  - "[[structure/synthetic-asset-management/module-asset-registry]]"
  - "[[business-logic/synthetic-asset-management/procurement-approval-tier-policy]]"
---

# Module: procurement-handler

รับและจัดการ procurement request ตั้งแต่ขั้นตอน draft ไปจนถึงการอนุมัติและการสั่งซื้อจริง ทำหน้าที่เป็น module เดียวที่ route request ผ่าน approval tier ที่ถูกต้องตามมูลค่าการซื้อ และเมื่อ request ได้รับอนุมัติแล้วจะ trigger การสร้าง asset record ใหม่ใน [[structure/synthetic-asset-management/module-asset-registry]] โดยอัตโนมัติ

## ฟังก์ชันหลัก
- `submitRequest(requesterId: string, items: ProcurementItem[]): Promise<ProcurementRequest>` — ยื่น procurement request ใหม่ คืน request พร้อม tier ที่ต้องขอ approval
- `approveRequest(requestId: string, approverId: string): Promise<void>` — อนุมัติ request ตรวจสอบว่า approver มีสิทธิ์ตาม [[business-logic/synthetic-asset-management/procurement-approval-tier-policy]]
- `rejectRequest(requestId: string, approverId: string, reason: string): Promise<void>` — ปฏิเสธ request และแจ้งเหตุผลให้ requester
- `markAsReceived(requestId: string, receivedItems: ReceivedItem[]): Promise<string[]>` — บันทึกว่าสินค้าถึงมือแล้วและ trigger การสร้าง asset record คืน asset_id ที่สร้าง

## State

draft → pending_approval → approved | rejected → ordered → received

## ความสัมพันธ์กับ module อื่น

เมื่อ `markAsReceived` ถูกเรียก จะเรียก [[structure/synthetic-asset-management/module-asset-registry]] เพื่อสร้าง asset record ใหม่โดยอัตโนมัติ — นี่เป็นช่องทางเดียวที่ถูกต้องในการเพิ่มสินทรัพย์ใหม่เข้าระบบ ดู [[business-logic/synthetic-asset-management/procurement-approval-tier-policy]] สำหรับเกณฑ์ tier
