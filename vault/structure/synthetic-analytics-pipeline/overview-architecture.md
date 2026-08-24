---
layer: structure
tags: [analytics-pipeline, dataflow, architecture, overview]
created: 2025-12-30
links:
  - "[[structure/synthetic-analytics-pipeline/module-ingest-connector]]"
  - "[[structure/synthetic-analytics-pipeline/module-transform-engine]]"
  - "[[structure/synthetic-analytics-pipeline/module-schema-registry]]"
  - "[[structure/synthetic-analytics-pipeline/module-job-orchestrator]]"
  - "[[structure/synthetic-analytics-pipeline/module-data-quality-checker]]"
  - "[[structure/synthetic-analytics-pipeline/module-warehouse-loader]]"
---

# ภาพรวมสถาปัตยกรรม DataFlow — แพลตฟอร์ม ETL วิเคราะห์ข้อมูล

DataFlow คือแพลตฟอร์ม ETL (Extract-Transform-Load) ภายในที่ทีมข้อมูลใช้ดึงข้อมูลจากระบบต้นทางหลากหลายชนิด (ฐานข้อมูล transactional, SaaS API ภายนอก, ไฟล์ CSV ที่ทีมธุรกิจอัปโหลดเอง) มาทำความสะอาด แปลงรูป แล้วโหลดเข้า data warehouse กลางให้ทีมวิเคราะห์และแดชบอร์ดต่างๆ ดึงไปใช้ต่อได้ DataFlow ไม่ใช่เจ้าของข้อมูลต้นทาง — เป็นแค่ท่อที่พาข้อมูลไหลผ่านและแปลงรูประหว่างทาง

ระบบแบ่งเป็น service ย่อยตามหน้าที่ ตั้งแต่เชื่อมต่อระบบต้นทาง ไปจนถึงตรวจสอบคุณภาพข้อมูลก่อนโหลดเข้า warehouse จริง ทีมวิศวกรรมเรียกช่วง 01:00-04:00 ว่า nightly batch window เพราะเป็นช่วงที่ job หลักส่วนใหญ่รันพร้อมกันตามตารางเวลาเพื่อให้ dashboard ตอนเช้ามีข้อมูลล่าสุดของวันก่อนหน้าครบถ้วน

## Module หลัก

- **ingest-connector** — เชื่อมต่อระบบต้นทางหลากหลายชนิด (ฐานข้อมูล, SaaS API, ไฟล์ที่อัปโหลด) แล้วดึงข้อมูลดิบเข้ามาเก็บใน `raw_extracts` โดยไม่แปลงรูปใดๆ ดู [[structure/synthetic-analytics-pipeline/module-ingest-connector]]
- **transform-engine** — แปลงข้อมูลดิบจาก `raw_extracts` ตามกฎการแปลงที่นิยามไว้ต่อ dataset (ทำความสะอาด, normalize, join กับข้อมูลอ้างอิง) แยกออกมาจาก ingest-connector ตั้งแต่กลางปี 2025 เพราะกฎการแปลงซับซ้อนขึ้นเรื่อยๆ ดู [[structure/synthetic-analytics-pipeline/module-transform-engine]]
- **schema-registry** — เก็บนิยาม schema ของทุก dataset ทุกเวอร์ชัน และตรวจสอบความเข้ากันได้เมื่อมีการเป ดู [[structure/synthetic-analytics-pipeline/module-schema-registry]]
- **job-orchestrator** — จัดลำดับการรัน job ทั้งหมดใน pipeline ตาม DAG dependency ที่กำหนดไว้ (extract → ดู [[structure/synthetic-analytics-pipeline/module-job-orchestrator]]
- **data-quality-checker** — รันชุดกฎตรวจสอบคุณภาพข้อมูล (ค่า null เกินเกณฑ์, ค่าซ้ำผิดปกติ, ค่านอกช่วงที่คาด ดู [[structure/synthetic-analytics-pipeline/module-data-quality-checker]]
- **warehouse-loader** — โหลดข้อมูลที่ผ่านการแปลงและตรวจคุณภาพแล้วเข้า data warehouse จริง รองรับทั้งการโ ดู [[structure/synthetic-analytics-pipeline/module-warehouse-loader]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-analytics-pipeline/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-analytics-pipeline/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-analytics-pipeline/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-analytics-pipeline/database-schema]]
