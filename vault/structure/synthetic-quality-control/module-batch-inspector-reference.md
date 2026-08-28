---
layer: structure
tags: [batch, module, core, reference, identifiers]
created: 2026-02-19
links:
  - "[[structure/synthetic-quality-control/module-batch-inspector]]"
  - "[[business-logic/synthetic-quality-control/rework-approval-authority-policy]]"
  - "[[business-logic/synthetic-quality-control/batch-rejection-threshold-policy]]"
---

# batch-inspector — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด batch-inspector สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-quality-control/module-batch-inspector]])

## Public functions
- `evaluateBatch(batchId: string): Promise<BatchVerdict>` — ตัดสินใจว่า batch ผ่าน/rework/quarantine จากผล SPC และ inspection ที่รวบรวมได้
- `recordInspectionResult(batchId: string, inspectorId: string, result: InspectionResult): Promise<void>` — บันทึกผลตรวจจากผู้ตรวจ พร้อมตรวจว่าซ้อนทับกับผู้ตรวจคนก่อนหรือไม่
- `overrideBatchStatus(batchId: string, newStatus: BatchStatus, authorizedBy: string, reason: string): Promise<void>` — เปลี่ยนสถานะ batch โดยผู้มีอำนาจ ดู [[business-logic/synthetic-quality-control/rework-approval-authority-policy]]
- `getBatchHistory(batchId: string): Promise<BatchEvent[]>` — ดู history การเปลี่ยนสถานะและผู้ตัดสินใจทั้งหมดของ batch นั้น

## Internal constants
- `DUAL_INSPECTOR_LOCK_WINDOW_SEC = 30`
- `MAX_REWORK_CYCLES_BEFORE_QUARANTINE = 2`

## Type

```ts
interface BatchVerdict {
  batchId: string;
  verdict: "pass" | "rework_required" | "quarantined";
  triggeredBy: string[];  // rule violation IDs
  decidedAt: string;  // ISO 8601
  decidedBy: "system" | string;  // inspectorId
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการตัดสินใจ batch ที่ [[business-logic/synthetic-quality-control/batch-rejection-threshold-policy]]
