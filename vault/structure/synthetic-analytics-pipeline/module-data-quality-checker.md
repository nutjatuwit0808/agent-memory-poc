---
layer: structure
tags: [quality, module]
created: 2025-11-02
links:
  - "[[structure/synthetic-analytics-pipeline/module-transform-engine]]"
  - "[[structure/synthetic-analytics-pipeline/queue-architecture]]"
  - "[[structure/synthetic-analytics-pipeline/module-job-orchestrator]]"
  - "[[business-logic/synthetic-analytics-pipeline/quality-gate-policy]]"
---

# Module: data-quality-checker

รันชุดกฎตรวจสอบคุณภาพข้อมูล (ค่า null เกินเกณฑ์, ค่าซ้ำผิดปกติ, ค่านอกช่วงที่คาดไว้, การมี PII ที่ไม่ควรมี) กับข้อมูลที่แปลงแล้วก่อนจะยอมให้โหลดเข้า warehouse จริง แยกออกมาเพราะกฎคุณภาพแตกต่างกันมากตาม dataset และต้องปรับได้โดยไม่กระทบ transform logic

## ฟังก์ชันหลัก
- `runQualityChecks(datasetId: string, runId: string): Promise<QualityReport>` — รันกฎตรวจสอบทั้งหมดของ dataset กับข้อมูลรอบนั้น
- `registerQualityRule(datasetId: string, rule: QualityRule): Promise<void>` — เพิ่มหรืออัปเดตกฎตรวจสอบสำหรับ dataset
- `overrideCheckFailure(runId: string, checkId: string, approvedBy: string): Promise<void>` — อนุมัติให้ผ่านทั้งที่ check ไม่ผ่าน ต้องมีคนยืนยันเสมอ

## ความสัมพันธ์กับ module อื่น

subscribe `transform.completed` จาก [[structure/synthetic-analytics-pipeline/module-transform-engine]] (ดู [[structure/synthetic-analytics-pipeline/queue-architecture]]) — ถ้า check ไม่ผ่านจะ publish `quality.check_failed` ให้ [[structure/synthetic-analytics-pipeline/module-job-orchestrator]] ตัดสินใจว่าจะหยุด DAG หรือให้ผ่านแบบมีเงื่อนไข ดู [[business-logic/synthetic-analytics-pipeline/quality-gate-policy]]
