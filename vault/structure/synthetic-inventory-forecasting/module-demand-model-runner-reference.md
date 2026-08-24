---
layer: structure
tags: [forecasting, module, core, reference, identifiers]
created: 2026-04-26
links:
  - "[[structure/synthetic-inventory-forecasting/module-demand-model-runner]]"
  - "[[business-logic/synthetic-inventory-forecasting/model-retrain-policy]]"
---

# demand-model-runner — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด demand-model-runner สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-inventory-forecasting/module-demand-model-runner]])

## Public functions
- `runForecastBatch(regionId: string, asOfDate: string): Promise<BatchResult>` — รันพยากรณ์ทั้งภูมิภาคสำหรับคืนนั้น แบ่งเป็น shard ย่อยตาม category
- `getForecast(skuId: string, storeId: string, horizonWeeks: number): Promise<ForecastPoint[]>` — คืนผลพยากรณ์ดิบ (ก่อนปรับฤดูกาล) ตาม horizon ที่ขอ
- `retryFailedShard(batchId: string, shardId: string): Promise<void>` — รันเฉพาะ shard ที่ล้มเหลวซ้ำ โดยไม่ต้องรัน batch ทั้งก้อนใหม่

## Internal constants
- `FORECAST_HORIZON_WEEKS = 12`
- `MAX_SHARD_RETRY = 2`
- `MODEL_TIMEOUT_MS = 180000`

## Type

```ts
interface ForecastPoint {
  skuId: string;
  storeId: string;
  weekStart: string;
  predictedQty: number;
  confidenceLow: number;
  confidenceHigh: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่อง retrain ที่ [[business-logic/synthetic-inventory-forecasting/model-retrain-policy]]
