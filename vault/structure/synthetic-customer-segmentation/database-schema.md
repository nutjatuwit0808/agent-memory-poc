---
layer: structure
tags: [customer-segmentation, segmentiq, database, schema]
created: 2026-08-17
links:
  - "[[structure/synthetic-customer-segmentation/module-event-ingester]]"
  - "[[business-logic/synthetic-customer-segmentation/pii-field-inclusion-policy]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-customer-segmentation/module-event-ingester]] ดูแล ได้แก่ `events` (raw event ทุกชิ้นที่ ingest เข้ามา), `event_dedup_log` (fingerprint สำหรับตรวจ duplicate), และ `event_schemas` สำหรับ version ของ schema แต่ละ event type

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `events` | event-ingester | partition by date เพื่อ query performance |
| `segment_definitions` | segment-builder | definition ของ segment แต่ละตัว |
| `segment_memberships` | membership-refresher | snapshot ล่าสุดว่า customer ไหนอยู่ใน segment ไหน |
| `export_logs` | channel-exporter | ประวัติ export ทุกครั้งพร้อม channel และ result |
| `health_scores` | health-monitor | ค่า health score ของแต่ละ segment รายวัน |
| `attribution_results` | attribution-engine | ผลการคำนวณ attribution ต่อ segment |

ทุกตารางที่เกี่ยวกับ customer ต้องไม่เก็บ PII โดยตรง — ใช้ `customer_token` (hash ของ customer ID) แทน ดู [[business-logic/synthetic-customer-segmentation/pii-field-inclusion-policy]] สำหรับกฎเรื่องนี้
