---
layer: structure
tags: [signal, module, core]
created: 2026-03-13
links:
  - "[[convention/synthetic-fraud-detection/signal-schema-convention]]"
---

# Module: signal-collector

รับ raw event จาก API gateway แล้วแปลงเป็น structured signal ก่อนส่งต่อเข้า analysis pipeline ทำหน้าที่เป็น schema validator และ enrichment layer — เพิ่มข้อมูลที่ขาด เช่น IP geolocation, device metadata, และ timestamp normalization ก่อนที่ downstream service อื่นจะเห็น event

## ฟังก์ชันหลัก
- `ingestEvent(rawEvent: RawEvent): Promise<Signal>` — รับ event ดิบ validate schema แล้วแปลงเป็น Signal object พร้อม enrich metadata
- `enrichWithGeolocation(ip: string): Promise<GeoData>` — แปลง IP address เป็นข้อมูลตำแหน่งและ ISP ใช้ใน risk scoring
- `publishSignal(signal: Signal): Promise<void>` — ส่ง signal เข้า queue เพื่อให้ rule-engine และ ml-scorer consume พร้อมกัน
- `replaySignals(from: string, to: string, eventType?: string): Promise<number>` — replay signal ในช่วงเวลาที่กำหนด ใช้ตอน backtest rule ใหม่หรือ diagnose ML drift

## State

received → validated | rejected (schema error) → enriched → published

## ความสัมพันธ์กับ module อื่น

ไม่ตัดสินใจเรื่อง fraud เลย — เป็นแค่ ingest และ normalize layer ถ้า schema ไม่ตรงจะ reject และ log เป็น `warn` ไม่ใช่ error เพราะ client อาจส่ง event version เก่าระหว่าง migration ดู [[convention/synthetic-fraud-detection/signal-schema-convention]] สำหรับ schema ที่รองรับ
