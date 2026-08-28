---
layer: structure
tags: [ingestion, module, core, reference, identifiers]
created: 2025-11-09
links:
  - "[[structure/synthetic-customer-segmentation/module-event-ingester]]"
  - "[[business-logic/synthetic-customer-segmentation/data-retention-policy]]"
  - "[[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]]"
---

# event-ingester — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด event-ingester สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-customer-segmentation/module-event-ingester]])

## Public functions
- `ingestEvent(source: EventSource, payload: unknown): Promise<IngestResult>` — รับ event ใหม่ validate schema และ check duplicate ก่อน store
- `getEventsByCustomer(customerToken: string, since: string): Promise<Event[]>` — ดึง event ของ customer ในช่วงเวลาที่ระบุ ใช้ customer_token ไม่ใช่ PII โดยตรง
- `purgeEventsOlderThan(retentionDays: number): Promise<number>` — ลบ event ที่เก่าเกินกว่า retention policy คืนจำนวนที่ลบ ดู [[business-logic/synthetic-customer-segmentation/data-retention-policy]]
- `getSchemaVersion(eventType: string): Promise<SchemaVersion>` — ดึง schema version ปัจจุบันของ event type นั้นสำหรับ backward compatibility check

## Internal constants
- `EVENT_DEDUP_WINDOW_HOURS = 24`
- `MAX_EVENT_PAYLOAD_BYTES = 65536`
- `INGEST_BATCH_SIZE = 500`

## Type

```ts
interface IngestResult {
  eventId: string;
  status: "stored" | "duplicate" | "rejected";
  reason?: "schema_invalid" | "payload_too_large" | "duplicate_fingerprint";
  ingestedAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]]
