---
layer: structure
tags: [schema, module]
created: 2026-01-02
links:
  - "[[structure/synthetic-analytics-pipeline/service-boundaries]]"
  - "[[structure/synthetic-analytics-pipeline/module-transform-engine]]"
---

# Module: schema-registry

เก็บนิยาม schema ของทุก dataset ทุกเวอร์ชัน และตรวจสอบความเข้ากันได้เมื่อมีการเปลี่ยนแปลง schema จากต้นทาง เป็น service เดียวที่มีสิทธิ์อนุมัติว่า schema ใหม่ "เข้ากันได้" (backward compatible) หรือ "breaking change" — ไม่มี service ไหนตัดสินใจเรื่องนี้เองได้

## ฟังก์ชันหลัก
- `checkCompatibility(datasetId: string, newSchema: SchemaDef): Promise<CompatibilityResult>` — เทียบ schema ใหม่กับเวอร์ชันล่าสุด บอกว่าเข้ากันได้หรือ breaking
- `registerSchemaVersion(datasetId: string, schema: SchemaDef): Promise<string>` — บันทึก schema เวอร์ชันใหม่ คืน versionId
- `getActiveSchema(datasetId: string): Promise<SchemaDef>` — คืน schema เวอร์ชันปัจจุบันที่ใช้งานอยู่

## ความสัมพันธ์กับ module อื่น

ไม่รู้จักข้อมูลจริงสักแถวเดียว (ดู [[structure/synthetic-analytics-pipeline/service-boundaries]]) — เมื่อ [[structure/synthetic-analytics-pipeline/module-transform-engine]] เจอ schema ที่เปลี่ยนจากต้นทาง จะเป็น schema-registry ที่ตัดสินใจว่า breaking change หรือไม่ แทนที่จะให้ transform-engine ตัดสินใจเอง เพื่อคุมนโยบายความเข้ากันได้ให้อยู่จุดเดียว
