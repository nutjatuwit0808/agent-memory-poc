---
layer: structure
tags: [inventory-forecasting, forecastiq, architecture, overview]
created: 2026-07-30
links:
  - "[[structure/synthetic-inventory-forecasting/module-demand-model-runner]]"
  - "[[structure/synthetic-inventory-forecasting/module-seasonality-adjuster]]"
  - "[[structure/synthetic-inventory-forecasting/module-replenishment-recommender]]"
  - "[[structure/synthetic-inventory-forecasting/module-forecast-accuracy-tracker]]"
  - "[[structure/synthetic-inventory-forecasting/module-feature-store]]"
  - "[[structure/synthetic-inventory-forecasting/module-anomaly-flagger]]"
---

# ภาพรวมสถาปัตยกรรม ForecastIQ — ระบบพยากรณ์ความต้องการสินค้าคงคลัง

ForecastIQ คือแพลตฟอร์มพยากรณ์ยอดขายล่วงหน้าระดับ SKU x สาขา สำหรับเชนค้าปลีกขนาดกลางถึงใหญ่ ทำงานร่วมกับระบบ ERP/POS เดิมของลูกค้าแต่ละราย โดย ForecastIQ รับผิดชอบเฉพาะชั้น "พยากรณ์และแนะนำการเติมสินค้า" ส่วนระบบ ERP ยังคงเป็นเจ้าของข้อมูล inventory position และการสั่งซื้อจริงระดับธุรกิจ

ระบบแบ่งเป็นหลาย service ย่อยตามหน้าที่ ตั้งแต่รัน demand model รายคืน ปรับค่าตามฤดูกาล/โปรโมชัน ไปจนถึงแนะนำจำนวนเติมสินค้าและเฝ้าระวังความผิดปกติของยอดขาย ทีมวิศวกรรมเรียกช่วง 6 สัปดาห์ก่อนเทศกาลใหญ่ (เช่น BigSale 11.11/12.12) ว่า high-volatility window เพราะเป็นช่วงที่ demand pattern เบี่ยงเบนจาก baseline มากที่สุดและ error ของโมเดลสูงขึ้นตามไปด้วย

## Module หลัก

- **demand-model-runner** — รับผิดชอบรันโมเดลพยากรณ์ demand ดิบต่อ SKU x store ทุกคืน แยกออกมาจาก "forecast- ดู [[structure/synthetic-inventory-forecasting/module-demand-model-runner]]
- **seasonality-adjuster** — ปรับค่าพยากรณ์ดิบด้วย seasonal index และ promo uplift factor เพื่อแก้ปัญหาที่โมเ ดู [[structure/synthetic-inventory-forecasting/module-seasonality-adjuster]]
- **replenishment-recommender** — แปลงผลพยากรณ์ที่ปรับฤดูกาลแล้วรวมกับ inventory position ปัจจุบันจาก ERP ให้เป็นค ดู [[structure/synthetic-inventory-forecasting/module-replenishment-recommender]]
- **forecast-accuracy-tracker** — เทียบผลพยากรณ์กับยอดขายจริงหลังจากสัปดาห์นั้นผ่านไปแล้ว คำนวณ WAPE (Weighted Abs ดู [[structure/synthetic-inventory-forecasting/module-forecast-accuracy-tracker]]
- **feature-store** — ศูนย์กลาง feature วิศวกรรมทั้งหมดที่ป้อนให้โมเดล (rolling sales average, ราคา, p ดู [[structure/synthetic-inventory-forecasting/module-feature-store]]
- **anomaly-flagger** — เฝ้าระวังส่วนต่าง (residual) ระหว่างยอดขายจริงกับพยากรณ์แบบเกือบ real-time เพื่อ ดู [[structure/synthetic-inventory-forecasting/module-anomaly-flagger]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-inventory-forecasting/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-inventory-forecasting/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-inventory-forecasting/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-inventory-forecasting/database-schema]]
