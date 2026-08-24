---
layer: structure
tags: [pipeline, module, core, reference, identifiers]
created: 2025-09-27
links:
  - "[[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]]"
  - "[[business-logic/synthetic-recruitment-ats/pipeline-auto-advance-policy]]"
---

# candidate-pipeline-tracker — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด candidate-pipeline-tracker สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]])

## Public functions
- `advanceStage(candidateId: string, requisitionId: string, toStage: PipelineStage): Promise<void>` — ย้ายผู้สมัครไปขั้นถัดไปใน pipeline
- `rejectCandidate(candidateId: string, requisitionId: string, reason: string): Promise<void>` — ปฏิเสธผู้สมัครออกจาก pipeline พร้อมเหตุผล
- `getCurrentStage(candidateId: string, requisitionId: string): Promise<PipelineStage>` — คืนขั้นปัจจุบันของผู้สมัครใน requisition ที่ระบุ
- `mergeDuplicateCandidate(primaryId: string, duplicateId: string): Promise<void>` — รวม record ผู้สมัครที่ระบบตรวจพบว่าซ้ำกันเข้าด้วยกัน

## Internal constants
- `DUPLICATE_MATCH_THRESHOLD = 0.92`
- `STAGE_TRANSITION_LOCK_TTL_MS = 5000`

## Type

```ts
interface PipelineStage {
  candidateId: string;
  requisitionId: string;
  stage: "applied" | "screening" | "interviewing" | "offer" | "hired" | "rejected" | "withdrawn";
  updatedAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง auto-advance ที่ [[business-logic/synthetic-recruitment-ats/pipeline-auto-advance-policy]]
