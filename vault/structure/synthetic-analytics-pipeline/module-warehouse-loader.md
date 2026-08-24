---
layer: structure
tags: [load, module, core]
created: 2026-05-18
links:
  - "[[structure/synthetic-analytics-pipeline/module-data-quality-checker]]"
  - "[[structure/synthetic-analytics-pipeline/module-transform-engine]]"
  - "[[business-logic/synthetic-analytics-pipeline/backfill-load-policy]]"
---

# Module: warehouse-loader

โหลดข้อมูลที่ผ่านการแปลงและตรวจคุณภาพแล้วเข้า data warehouse จริง รองรับทั้งการโหลดแบบ full refresh และ incremental append เป็น service เดียวที่มีสิทธิ์เขียนเข้า warehouse โดยตรง — service อื่นทั้งหมดเขียนได้แค่ staging area ของตัวเอง

## ฟังก์ชันหลัก
- `loadToWarehouse(datasetId: string, runId: string, mode: "append" | "upsert" | "full_refresh"): Promise<LoadResult>` — โหลดข้อมูลเข้า warehouse ตาม mode ที่กำหนด
- `verifyLoadIntegrity(runId: string): Promise<IntegrityCheckResult>` — เทียบจำนวนแถวและ checksum ระหว่างข้อมูลที่ควรโหลดกับที่โหลดจริง
- `rollbackLoad(runId: string): Promise<void>` — ถอนข้อมูลที่โหลดผิดพลาดออกจาก warehouse โดยไม่กระทบข้อมูลรอบก่อนหน้า

## State

pending → loading → verifying → committed | rolled_back

## ความสัมพันธ์กับ module อื่น

รับข้อมูลจาก [[structure/synthetic-analytics-pipeline/module-data-quality-checker]] เท่านั้น ไม่รับข้อมูลตรงจาก [[structure/synthetic-analytics-pipeline/module-transform-engine]] แม้แต่กรณีเร่งด่วน เพื่อไม่ให้มีทางลัดข้าม quality gate ได้เลยไม่ว่ากรณีใด ดู [[business-logic/synthetic-analytics-pipeline/backfill-load-policy]] สำหรับกรณีโหลดข้อมูลย้อนหลังจำนวนมาก
