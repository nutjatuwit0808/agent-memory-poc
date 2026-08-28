---
layer: structure
tags: [ingestion, module, core]
created: 2026-07-31
links:
  - "[[business-logic/synthetic-customer-segmentation/data-retention-policy]]"
  - "[[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]]"
  - "[[structure/synthetic-customer-segmentation/module-membership-refresher]]"
  - "[[support-cases/synthetic-customer-segmentation/case-8214]]"
---

# Module: event-ingester

รับ behavioral event จากหลาย source ได้แก่ web tracking pixel, purchase webhook จาก e-commerce system, และ support ticket event จาก helpdesk — ทำ normalize, validate schema, และ deduplicate ก่อนบันทึกลง event store แยกออกมาเป็น module อิสระเพราะ logic การจัดการ source แต่ละแหล่งต่างกัน และการ scale ต้องทำแยกจาก module อื่น

## ฟังก์ชันหลัก
- `ingestEvent(source: EventSource, payload: unknown): Promise<IngestResult>` — รับ event ใหม่ validate schema และ check duplicate ก่อน store
- `getEventsByCustomer(customerToken: string, since: string): Promise<Event[]>` — ดึง event ของ customer ในช่วงเวลาที่ระบุ ใช้ customer_token ไม่ใช่ PII โดยตรง
- `purgeEventsOlderThan(retentionDays: number): Promise<number>` — ลบ event ที่เก่าเกินกว่า retention policy คืนจำนวนที่ลบ ดู [[business-logic/synthetic-customer-segmentation/data-retention-policy]]
- `getSchemaVersion(eventType: string): Promise<SchemaVersion>` — ดึง schema version ปัจจุบันของ event type นั้นสำหรับ backward compatibility check

## State

received → validated → deduplicated → stored | rejected (schema invalid หรือ duplicate) — ดู [[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]] สำหรับ SLA ของเวลา ingest ถึงพร้อมใช้

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-customer-segmentation/module-membership-refresher]] query event store ของ module นี้เพื่อคำนวณ membership — ถ้า event-ingester ช้าหรือ backlog สะสม จะทำให้ membership ที่คำนวณได้ใช้ข้อมูลเก่า ซึ่งเป็น root cause ของ [[support-cases/synthetic-customer-segmentation/case-8214]]
