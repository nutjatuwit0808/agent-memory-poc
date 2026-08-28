---
layer: structure
tags: [segmentation, module, core, reference, identifiers]
created: 2026-01-15
links:
  - "[[structure/synthetic-customer-segmentation/module-segment-builder]]"
  - "[[business-logic/synthetic-customer-segmentation/segment-archival-policy]]"
  - "[[business-logic/synthetic-customer-segmentation/minimum-segment-size-policy]]"
  - "[[business-logic/synthetic-customer-segmentation/pii-field-inclusion-policy]]"
---

# segment-builder — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด segment-builder สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-customer-segmentation/module-segment-builder]])

## Public functions
- `createSegment(definition: SegmentDefinition, createdBy: string): Promise<Segment>` — สร้าง segment ใหม่ validate rule syntax และ publish event ให้ refresher
- `updateSegment(segmentId: string, definition: SegmentDefinition, updatedBy: string): Promise<void>` — แก้ definition ของ segment ที่มีอยู่ trigger refresh อัตโนมัติ
- `previewSegmentSize(definition: SegmentDefinition): Promise<number>` — ประมาณขนาด segment จาก event snapshot โดยไม่ commit definition ให้ใช้ก่อน save จริง
- `archiveSegment(segmentId: string, archivedBy: string): Promise<void>` — archive segment ที่ไม่ใช้แล้ว ดู [[business-logic/synthetic-customer-segmentation/segment-archival-policy]]

## Internal constants
- `MAX_RULES_PER_SEGMENT = 20`
- `PREVIEW_SAMPLE_SIZE = 10000`
- `MIN_SEGMENT_SIZE_FOR_EXPORT = 100`

## Type

```ts
interface SegmentDefinition {
  name: string;
  rules: SegmentRule[];
  operator: "AND" | "OR";
  lookbackDays: number;
  excludePiiFields: boolean;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง minimum size และ PII ที่ [[business-logic/synthetic-customer-segmentation/minimum-segment-size-policy]] และ [[business-logic/synthetic-customer-segmentation/pii-field-inclusion-policy]]
