---
layer: structure
tags: [seasonality, module]
created: 2026-06-29
links:
  - "[[structure/synthetic-inventory-forecasting/module-demand-model-runner]]"
  - "[[structure/synthetic-inventory-forecasting/module-feature-store]]"
---

# Module: seasonality-adjuster

ปรับค่าพยากรณ์ดิบด้วย seasonal index และ promo uplift factor เพื่อแก้ปัญหาที่โมเดลหลักมีประวัติข้อมูลไม่พอจะเรียนรู้ปรากฏการณ์ตามฤดูกาลหรือเทศกาลได้แม่นยำเอง โดยเฉพาะ SKU ใหม่ที่ยังไม่เคยผ่านเทศกาลมาก่อนเลย

## ฟังก์ชันหลัก
- `applySeasonalIndex(rawForecast: ForecastPoint, categoryId: string): ForecastPoint` — คูณค่าพยากรณ์ดิบด้วย seasonal index ของ category/สัปดาห์นั้น
- `registerPromoWindow(promoId: string, startDate: string, endDate: string, upliftFactor: number): Promise<void>` — ลงทะเบียนช่วงโปรโมชันและตัวคูณ uplift ที่คาดไว้ล่วงหน้า
- `recalculateIndexFromHistory(categoryId: string): Promise<void>` — คำนวณ seasonal index ใหม่จากประวัติยอดขายย้อนหลัง เรียกเมื่อเทศกาลผ่านไปแล้วเพื่อ calibrate รอบถัดไป

## ความสัมพันธ์กับ module อื่น

รับ input จาก [[structure/synthetic-inventory-forecasting/module-demand-model-runner]] ผ่าน event `forecast.completed` เท่านั้น ไม่แตะข้อมูลยอดขายดิบเองโดยตรง — ต้องอ่านผ่าน [[structure/synthetic-inventory-forecasting/module-feature-store]] เสมอเพื่อให้ feature ที่ใช้คำนวณ seasonal index มาจากแหล่งเดียวกับที่โมเดลใช้
