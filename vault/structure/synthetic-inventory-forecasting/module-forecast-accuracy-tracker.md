---
layer: structure
tags: [accuracy, module]
created: 2026-07-01
links:
  - "[[business-logic/synthetic-inventory-forecasting/model-retrain-policy]]"
  - "[[structure/synthetic-inventory-forecasting/module-seasonality-adjuster]]"
  - "[[structure/synthetic-inventory-forecasting/module-demand-model-runner]]"
---

# Module: forecast-accuracy-tracker

เทียบผลพยากรณ์กับยอดขายจริงหลังจากสัปดาห์นั้นผ่านไปแล้ว คำนวณ WAPE (Weighted Absolute Percentage Error) เป็นตัวชี้วัดหลักและ MAPE เป็นตัวเสริม ใช้ตัวเลขนี้ตัดสินใจว่า SKU/category ไหนต้อง retrain หรือให้คนตรวจสอบ

## ฟังก์ชันหลัก
- `recordActual(skuId: string, storeId: string, weekStart: string, actualQty: number, unit: SalesUnit): Promise<void>` — บันทึกยอดขายจริงของสัปดาห์นั้นเพื่อเทียบกับพยากรณ์
- `computeAccuracyMetrics(categoryId: string, periodStart: string, periodEnd: string): Promise<AccuracyReport>` — คำนวณ WAPE/MAPE รวมของ category ในช่วงเวลาที่ระบุ
- `flagLowAccuracySkus(threshold: number): Promise<string[]>` — คืนรายชื่อ SKU ที่ WAPE เกิน threshold ติดต่อกัน 2 สัปดาห์

## ความสัมพันธ์กับ module อื่น

ผลจาก `flagLowAccuracySkus` เป็น input หลักของ [[business-logic/synthetic-inventory-forecasting/model-retrain-policy]] — เทียบกับผลพยากรณ์ *หลังปรับฤดูกาลแล้ว* จาก [[structure/synthetic-inventory-forecasting/module-seasonality-adjuster]] เสมอ ไม่ใช่ผลดิบจาก [[structure/synthetic-inventory-forecasting/module-demand-model-runner]] เพราะการเทียบกับผลดิบจะทำให้ error ดูสูงเกินจริงในสัปดาห์ที่มีเทศกาล
