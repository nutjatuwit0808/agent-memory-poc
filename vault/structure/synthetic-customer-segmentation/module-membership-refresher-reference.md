---
layer: structure
tags: [membership, refresh, module, reference, identifiers]
created: 2025-11-17
links:
  - "[[structure/synthetic-customer-segmentation/module-membership-refresher]]"
  - "[[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]]"
  - "[[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]]"
---

# membership-refresher — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด membership-refresher สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-customer-segmentation/module-membership-refresher]])

## Public functions
- `refreshSegment(segmentId: string): Promise<RefreshResult>` — คำนวณ membership ใหม่สำหรับ segment เดียว บันทึก snapshot ใหม่ทับของเดิม
- `refreshAll(asOf: string): Promise<RefreshSummary>` — รัน refresh ทุก active segment ตาม schedule รายวัน ใช้ event data ณ เวลา asOf
- `getMembershipSnapshot(segmentId: string): Promise<MembershipSnapshot>` — ดึง snapshot ล่าสุดของ membership รวมถึงเวลาที่คำนวณ
- `getRefreshStatus(): Promise<RefreshStatus>` — ตรวจว่ากำลังมี refresh job รันอยู่หรือไม่ ป้องกัน concurrent run ตาม [[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]]

## Internal constants
- `REFRESH_SCHEDULE_CRON = "0 2 * * *"`
- `SINGLE_SEGMENT_TIMEOUT_MS = 300000`
- `MAX_CONCURRENT_REFRESH_JOBS = 1`

## Type

```ts
interface RefreshResult {
  segmentId: string;
  previousSize: number;
  newSize: number;
  computedAt: string;
  durationMs: number;
  status: "completed" | "failed" | "skipped_too_small";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง SLA และ concurrent instance ที่ [[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]] และ [[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]]
