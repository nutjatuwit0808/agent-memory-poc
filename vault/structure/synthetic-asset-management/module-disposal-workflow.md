---
layer: structure
tags: [disposal, compliance, module]
created: 2026-01-31
links:
  - "[[business-logic/synthetic-asset-management/disposal-certification-policy]]"
  - "[[structure/synthetic-asset-management/module-asset-registry]]"
  - "[[structure/synthetic-asset-management/module-depreciation-engine]]"
---

# Module: disposal-workflow

จัดการกระบวนการทำลายหรือจำหน่ายสินทรัพย์เมื่อสิ้นอายุการใช้งาน ตรวจสอบว่าทุกขั้นตอนมีใบรับรองที่ถูกต้องก่อนปิด record และป้องกันไม่ให้สินทรัพย์ถูก dispose โดยไม่มีเอกสารรับรอง เพราะอาจกระทบ data security compliance และข้อกำหนดด้านสิ่งแวดล้อม

## ฟังก์ชันหลัก
- `initiateDisposal(assetId: string, reason: DisposalReason, requestedBy: string): Promise<DisposalRecord>` — เริ่มกระบวนการ disposal สำหรับสินทรัพย์ชิ้นหนึ่ง
- `uploadCertification(disposalId: string, certType: CertType, fileRef: string): Promise<void>` — แนบใบรับรองการทำลายข้อมูลหรือ recycle ตาม [[business-logic/synthetic-asset-management/disposal-certification-policy]]
- `completeDisposal(disposalId: string, completedBy: string): Promise<void>` — ปิด disposal record เมื่อทุกใบรับรองครบ และส่ง event ให้ asset-registry อัปเดตสถานะ
- `listPendingDisposals(): Promise<DisposalRecord[]>` — คืนรายการ disposal request ที่ยังรอใบรับรองหรือการยืนยัน

## ความสัมพันธ์กับ module อื่น

หลังจาก `completeDisposal` สำเร็จ จะ publish event `asset.disposed` ให้ [[structure/synthetic-asset-management/module-asset-registry]] เปลี่ยนสถานะสินทรัพย์เป็น `disposed` และ [[structure/synthetic-asset-management/module-depreciation-engine]] หยุดคำนวณค่าเสื่อมราคาสำหรับสินทรัพย์นั้น ดู [[business-logic/synthetic-asset-management/disposal-certification-policy]] สำหรับใบรับรองที่บังคับต้องมี
