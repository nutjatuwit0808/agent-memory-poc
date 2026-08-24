---
layer: structure
tags: [transform, module, core, reference, identifiers]
created: 2026-07-12
links:
  - "[[structure/synthetic-analytics-pipeline/module-transform-engine]]"
  - "[[business-logic/synthetic-analytics-pipeline/late-arriving-data-policy]]"
---

# transform-engine — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด transform-engine สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-analytics-pipeline/module-transform-engine]])

## Public functions
- `applyTransform(datasetId: string, runId: string): Promise<TransformResult>` — รันกฎการแปลงทั้งหมดของ dataset กับข้อมูลดิบรอบล่าสุด
- `registerTransformRule(datasetId: string, rule: TransformRule): Promise<void>` — เพิ่มหรืออัปเดตกฎการแปลงสำหรับ dataset
- `previewTransform(datasetId: string, sampleSize: number): Promise<TransformPreview>` — รันกฎการแปลงกับข้อมูลตัวอย่างเพื่อดูผลก่อน apply จริงกับข้อมูลทั้งหมด

## Internal constants
- `TRANSFORM_BATCH_SIZE_ROWS = 50000`
- `NULL_FILL_STRATEGY_DEFAULT = reject`

## Type

```ts
interface TransformResult {
  datasetId: string;
  runId: string;
  rowsIn: number;
  rowsOut: number;
  rejectedRows: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องข้อมูลมาช้าที่ [[business-logic/synthetic-analytics-pipeline/late-arriving-data-policy]]
