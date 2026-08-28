---
layer: structure
tags: [invalidation, module, core, reference, identifiers]
created: 2026-03-17
links:
  - "[[structure/synthetic-content-delivery/module-invalidation-dispatcher]]"
  - "[[business-logic/synthetic-content-delivery/invalidation-propagation-policy]]"
---

# invalidation-dispatcher — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด invalidation-dispatcher สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-content-delivery/module-invalidation-dispatcher]])

## Public functions
- `dispatchInvalidation(tenantId: string, pattern: string): Promise<InvalidationJob>` — สร้าง invalidation job และส่งไปยัง edge node ทุกจุด คืน job ID สำหรับ tracking
- `checkPropagationStatus(jobId: string): Promise<PropagationStatus>` — ตรวจสอบว่า edge node แต่ละจุด acknowledge แล้วหรือยัง
- `retryFailedNodes(jobId: string): Promise<void>` — ส่ง invalidation ซ้ำให้ edge node ที่ยังไม่ acknowledge ตาม [[business-logic/synthetic-content-delivery/invalidation-propagation-policy]]
- `cancelInvalidation(jobId: string, reason: string): Promise<void>` — ยกเลิก invalidation job ที่ stuck โดยต้องมีผู้ดูแลระบบสั่ง

## Internal constants
- `PROPAGATION_TIMEOUT_SECONDS = 30`
- `MAX_PROPAGATION_RETRY_ATTEMPTS = 3`
- `ACKNOWLEDGMENT_POLL_INTERVAL_MS = 2000`

## Type

```ts
interface InvalidationJob {
  jobId: string;
  tenantId: string;
  pattern: string;
  status: "queued" | "propagating" | "partial_acknowledged" | "fully_acknowledged" | "timed_out";
  acknowledgedNodes: string[];
  totalNodes: number;
  createdAt: Date;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง timeout และ retry ที่ [[business-logic/synthetic-content-delivery/invalidation-propagation-policy]]
