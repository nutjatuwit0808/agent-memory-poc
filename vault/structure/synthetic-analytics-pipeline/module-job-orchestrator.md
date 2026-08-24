---
layer: structure
tags: [orchestration, module, core]
created: 2026-06-21
links:
  - "[[structure/synthetic-analytics-pipeline/service-boundaries]]"
  - "[[business-logic/synthetic-analytics-pipeline/dag-deadlock-policy]]"
---

# Module: job-orchestrator

จัดลำดับการรัน job ทั้งหมดใน pipeline ตาม DAG dependency ที่กำหนดไว้ (extract → transform → quality check → load) เป็น service เดียวที่ query ข้ามสถานะของทุก service อื่นพร้อมกันได้ (ข้อยกเว้นที่ตั้งใจ ดู [[structure/synthetic-analytics-pipeline/service-boundaries]])

## ฟังก์ชันหลัก
- `scheduleDag(dagId: string, trigger: "cron" | "manual" | "upstream"): Promise<string>` — เริ่มรัน DAG ใหม่ คืน runId
- `evaluateReadiness(jobId: string): Promise<boolean>` — ตรวจว่า job นี้พร้อมรันหรือยังจาก dependency ทั้งหมดที่ต้องเสร็จก่อน
- `markJobFailed(jobId: string, reason: string): Promise<void>` — mark job ล้มเหลว และตัดสินใจว่า job ที่ depend อยู่ต้องหยุดตามหรือไม่

## State

queued → ready → running → succeeded | failed | skipped (เมื่อ upstream ล้มเหลวและ dependency ไม่ optional)

## ความสัมพันธ์กับ module อื่น

ถ้า job อยู่ใน `running` นานเกิน threshold โดยไม่มีความคืบหน้ารายงานกลับจาก service ที่เกี่ยวข้อง ระบบจะ mark เป็น `stuck` — ดู [[business-logic/synthetic-analytics-pipeline/dag-deadlock-policy]] สำหรับกรณี dependency วนกลับมาหาตัวเอง
