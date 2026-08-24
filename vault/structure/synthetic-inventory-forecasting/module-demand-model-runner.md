---
layer: structure
tags: [forecasting, module, core]
created: 2026-05-06
links:
  - "[[business-logic/synthetic-inventory-forecasting/forecast-horizon-policy]]"
  - "[[structure/synthetic-inventory-forecasting/module-feature-store]]"
  - "[[structure/synthetic-inventory-forecasting/module-seasonality-adjuster]]"
---

# Module: demand-model-runner

รับผิดชอบรันโมเดลพยากรณ์ demand ดิบต่อ SKU x store ทุกคืน แยกออกมาจาก "forecast-service" ก้อนเดียวตั้งแต่กลางปี 2025 เพราะการรันโมเดล (compute-heavy, ต้อง scale ตาม GPU/CPU) กับการคำนวณ feature (I/O-heavy) มี resource profile ต่างกันมากจนต้อง scale แยกกัน

## ฟังก์ชันหลัก
- `runForecastBatch(regionId: string, asOfDate: string): Promise<BatchResult>` — รันพยากรณ์ทั้งภูมิภาคสำหรับคืนนั้น แบ่งเป็น shard ย่อยตาม category
- `getForecast(skuId: string, storeId: string, horizonWeeks: number): Promise<ForecastPoint[]>` — คืนผลพยากรณ์ดิบ (ก่อนปรับฤดูกาล) ตาม horizon ที่ขอ
- `retryFailedShard(batchId: string, shardId: string): Promise<void>` — รันเฉพาะ shard ที่ล้มเหลวซ้ำ โดยไม่ต้องรัน batch ทั้งก้อนใหม่

## State

queued → running → completed | failed | partial (บาง shard สำเร็จ บาง shard ล้มเหลว) — ดู [[business-logic/synthetic-inventory-forecasting/forecast-horizon-policy]] สำหรับความหมายของ horizon แต่ละช่วง

## ความสัมพันธ์กับ module อื่น

ดึง feature จาก [[structure/synthetic-inventory-forecasting/module-feature-store]] เท่านั้น ไม่คำนวณ feature เองแม้แต่ตัวเดียว และไม่เรียก [[structure/synthetic-inventory-forecasting/module-seasonality-adjuster]] โดยตรง — ปล่อยให้ seasonality-adjuster subscribe event `forecast.completed` แล้วดึงผลไปปรับเองภายหลัง เพื่อให้ demand-model-runner ไม่ต้องรู้จัก concept เรื่องฤดูกาลเลย
