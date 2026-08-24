---
layer: structure
tags: [analytics-pipeline, dataflow, boundaries]
created: 2026-04-16
links:
  - "[[structure/synthetic-analytics-pipeline/module-ingest-connector]]"
  - "[[structure/synthetic-analytics-pipeline/module-schema-registry]]"
  - "[[structure/synthetic-analytics-pipeline/module-job-orchestrator]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-analytics-pipeline/module-ingest-connector]] เป็นเจ้าของ raw data ที่ดึงมาจากต้นทางเท่านั้น ไม่รู้จัก schema เป้าหมายของ warehouse เลย ส่วน [[structure/synthetic-analytics-pipeline/module-schema-registry]] เป็นเจ้าของนิยาม schema ทุกเวอร์ชันโดยไม่เก็บข้อมูลจริงสักแถวเดียว

[[structure/synthetic-analytics-pipeline/module-job-orchestrator]] เป็น service เดียวที่ query ข้ามสถานะของ job จากทุก service อื่นพร้อมกันเพื่อตัดสินใจลำดับการรัน — เหตุผลที่ยอมให้ service นี้ทำ cross-domain query (ผิดหลักทั่วไป) คือการจัดลำดับ dependency ของ DAG ต้องเห็นสถานะทุก job พร้อมกันในเวลาที่ตัดสินใจ ไม่งั้นจะเกิดการรัน job ที่ dependency ยังไม่เสร็จ
