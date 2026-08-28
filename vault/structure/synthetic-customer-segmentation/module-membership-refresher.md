---
layer: structure
tags: [membership, refresh, module]
created: 2026-06-15
links:
  - "[[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]]"
  - "[[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]]"
  - "[[structure/synthetic-customer-segmentation/module-event-ingester]]"
  - "[[structure/synthetic-customer-segmentation/module-segment-builder]]"
  - "[[structure/synthetic-customer-segmentation/module-health-monitor]]"
---

# Module: membership-refresher

คำนวณและอัปเดต segment membership ทุกวันโดย evaluate event data ล่าสุดเทียบกับ segment definition ทั้งหมด — เป็น compute-heavy module ที่รันในช่วง off-peak เพื่อไม่แย่ง resource กับ real-time path แยกออกมาจาก segment-builder เพื่อให้ scale compute ได้แยกจาก definition storage

## ฟังก์ชันหลัก
- `refreshSegment(segmentId: string): Promise<RefreshResult>` — คำนวณ membership ใหม่สำหรับ segment เดียว บันทึก snapshot ใหม่ทับของเดิม
- `refreshAll(asOf: string): Promise<RefreshSummary>` — รัน refresh ทุก active segment ตาม schedule รายวัน ใช้ event data ณ เวลา asOf
- `getMembershipSnapshot(segmentId: string): Promise<MembershipSnapshot>` — ดึง snapshot ล่าสุดของ membership รวมถึงเวลาที่คำนวณ
- `getRefreshStatus(): Promise<RefreshStatus>` — ตรวจว่ากำลังมี refresh job รันอยู่หรือไม่ ป้องกัน concurrent run ตาม [[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]]

## State

idle → running → completed | failed — ดู [[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]] สำหรับเกณฑ์ว่า membership ถือว่า stale เมื่อไหร่

## ความสัมพันธ์กับ module อื่น

เป็น module เดียวที่ query ทั้ง event store ของ [[structure/synthetic-customer-segmentation/module-event-ingester]] และ definition ของ [[structure/synthetic-customer-segmentation/module-segment-builder]] พร้อมกัน และหลัง refresh เสร็จจะ publish `membership.refresh_completed` ให้ [[structure/synthetic-customer-segmentation/module-health-monitor]] คำนวณ health score ต่อทันที
