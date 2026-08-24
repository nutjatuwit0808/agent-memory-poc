---
layer: structure
tags: [transform, module, core]
created: 2026-01-21
links:
  - "[[business-logic/synthetic-analytics-pipeline/late-arriving-data-policy]]"
  - "[[structure/synthetic-analytics-pipeline/module-ingest-connector]]"
  - "[[structure/synthetic-analytics-pipeline/queue-architecture]]"
  - "[[structure/synthetic-analytics-pipeline/module-schema-registry]]"
  - "[[structure/synthetic-analytics-pipeline/module-warehouse-loader]]"
---

# Module: transform-engine

แปลงข้อมูลดิบจาก `raw_extracts` ตามกฎการแปลงที่นิยามไว้ต่อ dataset (ทำความสะอาด, normalize, join กับข้อมูลอ้างอิง) แยกออกมาจาก ingest-connector ตั้งแต่กลางปี 2025 เพราะกฎการแปลงซับซ้อนขึ้นเรื่อยๆ (การ join ข้ามหลาย source, การจัดการ null แบบต่างกันตาม field) จนทำให้ extract path ช้าลงถ้าคำนวณ inline

## ฟังก์ชันหลัก
- `applyTransform(datasetId: string, runId: string): Promise<TransformResult>` — รันกฎการแปลงทั้งหมดของ dataset กับข้อมูลดิบรอบล่าสุด
- `registerTransformRule(datasetId: string, rule: TransformRule): Promise<void>` — เพิ่มหรืออัปเดตกฎการแปลงสำหรับ dataset
- `previewTransform(datasetId: string, sampleSize: number): Promise<TransformPreview>` — รันกฎการแปลงกับข้อมูลตัวอย่างเพื่อดูผลก่อน apply จริงกับข้อมูลทั้งหมด

## State

pending → transforming → succeeded | failed — ดู [[business-logic/synthetic-analytics-pipeline/late-arriving-data-policy]] สำหรับเงื่อนไขข้อมูลมาช้า

## ความสัมพันธ์กับ module อื่น

subscribe `extract.completed` จาก [[structure/synthetic-analytics-pipeline/module-ingest-connector]] โดยตรงผ่าน queue (ดู [[structure/synthetic-analytics-pipeline/queue-architecture]]) — [[structure/synthetic-analytics-pipeline/module-schema-registry]] เป็นคนตรวจสอบว่า schema ของข้อมูลที่แปลงแล้วตรงกับที่ประกาศไว้หรือไม่ ก่อนส่งต่อให้ [[structure/synthetic-analytics-pipeline/module-warehouse-loader]]
