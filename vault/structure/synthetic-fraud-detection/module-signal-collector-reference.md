---
layer: structure
tags: [signal, module, core, reference, identifiers]
created: 2026-02-18
links:
  - "[[structure/synthetic-fraud-detection/module-signal-collector]]"
  - "[[business-logic/synthetic-fraud-detection/signal-retention-policy]]"
---

# signal-collector — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด signal-collector สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-fraud-detection/module-signal-collector]])

## Public functions
- `ingestEvent(rawEvent: RawEvent): Promise<Signal>` — รับ event ดิบ validate schema แล้วแปลงเป็น Signal object พร้อม enrich metadata
- `enrichWithGeolocation(ip: string): Promise<GeoData>` — แปลง IP address เป็นข้อมูลตำแหน่งและ ISP ใช้ใน risk scoring
- `publishSignal(signal: Signal): Promise<void>` — ส่ง signal เข้า queue เพื่อให้ rule-engine และ ml-scorer consume พร้อมกัน
- `replaySignals(from: string, to: string, eventType?: string): Promise<number>` — replay signal ในช่วงเวลาที่กำหนด ใช้ตอน backtest rule ใหม่หรือ diagnose ML drift

## Internal constants
- `SIGNAL_SCHEMA_VERSION = "3.2"`
- `GEO_LOOKUP_TIMEOUT_MS = 500`
- `SIGNAL_RETENTION_DAYS = 90`

## Type

```ts
interface Signal {
  eventId: string;
  eventType: "account_creation" | "login" | "promo_redemption" | "review_submission" | "bot_activity";
  userId: string;
  deviceId: string;
  ip: string;
  geo: GeoData;
  receivedAt: string; // ISO 8601 UTC
  payload: Record<string, unknown>;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง signal retention ที่ [[business-logic/synthetic-fraud-detection/signal-retention-policy]]
