---
layer: structure
tags: [batch, module, core]
created: 2026-06-21
links:
  - "[[structure/synthetic-quality-control/module-spc-analyzer]]"
  - "[[business-logic/synthetic-quality-control/rework-approval-authority-policy]]"
  - "[[business-logic/synthetic-quality-control/batch-rejection-threshold-policy]]"
---

# Module: batch-inspector

รับ event จาก [[structure/synthetic-quality-control/module-spc-analyzer]] แล้วตัดสินใจว่า batch แต่ละ batch จะผ่าน, ส่ง rework, หรือ quarantine โดยใช้เกณฑ์ที่กำหนดไว้ใน business rule เป็น service เดียวที่มีสิทธิ์เปลี่ยนสถานะ batch ทำให้ตรวจสอบการตัดสินใจได้จากจุดเดียว

## ฟังก์ชันหลัก
- `evaluateBatch(batchId: string): Promise<BatchVerdict>` — ตัดสินใจว่า batch ผ่าน/rework/quarantine จากผล SPC และ inspection ที่รวบรวมได้
- `recordInspectionResult(batchId: string, inspectorId: string, result: InspectionResult): Promise<void>` — บันทึกผลตรวจจากผู้ตรวจ พร้อมตรวจว่าซ้อนทับกับผู้ตรวจคนก่อนหรือไม่
- `overrideBatchStatus(batchId: string, newStatus: BatchStatus, authorizedBy: string, reason: string): Promise<void>` — เปลี่ยนสถานะ batch โดยผู้มีอำนาจ ดู [[business-logic/synthetic-quality-control/rework-approval-authority-policy]]
- `getBatchHistory(batchId: string): Promise<BatchEvent[]>` — ดู history การเปลี่ยนสถานะและผู้ตัดสินใจทั้งหมดของ batch นั้น

## State

pending → pass | rework_required | quarantined — rework_required → pass (หลัง rework ผ่าน) | quarantined (ถ้า rework ล้มเหลวซ้ำ) — quarantined เป็น terminal state ต้องมีคนยกเลิก hold

## ความสัมพันธ์กับ module อื่น

ดู [[business-logic/synthetic-quality-control/batch-rejection-threshold-policy]] สำหรับเกณฑ์ตัวเลขที่ใช้ตัดสินว่าต้อง rework หรือ quarantine ทันที และดู [[business-logic/synthetic-quality-control/rework-approval-authority-policy]] สำหรับว่าใครมีสิทธิ์อนุมัติ rework
