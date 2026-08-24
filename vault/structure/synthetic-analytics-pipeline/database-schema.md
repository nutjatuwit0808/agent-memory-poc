---
layer: structure
tags: [analytics-pipeline, dataflow, database, schema]
created: 2025-12-30
links:
  - "[[structure/synthetic-analytics-pipeline/module-ingest-connector]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-analytics-pipeline/module-ingest-connector]] ดูแล ได้แก่ `raw_extracts` (ข้อมูลดิบที่ดึงมาแต่ละรอบ เก็บแบบ append-only ไม่แก้ย้อนหลัง), `source_connections` (config การเชื่อมต่อระบบต้นทาง) และ `extract_run_log`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `raw_extracts` | ingest-connector | partition รายวันตาม extract timestamp เพราะปริมาณสูงมาก |
| `schema_versions` | schema-registry | ประวัติทุกเวอร์ชันของทุก schema พร้อม diff |
| `job_runs` | job-orchestrator | สถานะการรันของทุก job ใน DAG |
| `quality_check_results` | data-quality-checker | ผลตรวจแต่ละ check แยกตาม dataset และรอบเวลา |

ทุกตารางใช้ `dataset_id` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายคืนแทน
