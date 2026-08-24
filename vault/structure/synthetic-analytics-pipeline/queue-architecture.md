---
layer: structure
tags: [analytics-pipeline, dataflow, queue, async]
created: 2025-09-05
links:
  - "[[structure/synthetic-analytics-pipeline/module-transform-engine]]"
  - "[[structure/synthetic-analytics-pipeline/module-job-orchestrator]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `extract.completed`, `transform.completed`, `schema.changed`, `quality.check_failed`, `load.completed` — [[structure/synthetic-analytics-pipeline/module-transform-engine]] subscribe `extract.completed` แล้วเริ่มแปลงข้อมูลทันทีที่ raw data พร้อม

[[structure/synthetic-analytics-pipeline/module-job-orchestrator]] subscribe แทบทุก event ประเภทข้างต้นเพราะต้อง track ความคืบหน้าของทุก step ใน DAG แต่ไม่ publish event ระดับ data (เช่น `transform.completed`) เอง — publish แค่ event ระดับ orchestration ของตัวเอง (`job.started`, `job.failed`) เพื่อไม่ให้ปนกับ event สาย data pipeline
