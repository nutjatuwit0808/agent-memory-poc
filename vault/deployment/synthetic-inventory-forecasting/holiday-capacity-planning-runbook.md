---
layer: deployment
tags: [capacity, runbook]
created: 2026-03-04
links:
  - "[[business-logic/synthetic-inventory-forecasting/promo-flag-policy]]"
  - "[[structure/synthetic-inventory-forecasting/module-seasonality-adjuster]]"
  - "[[structure/synthetic-inventory-forecasting/module-demand-model-runner]]"
  - "[[deployment/synthetic-inventory-forecasting/scaling-policy]]"
---

# Holiday Capacity Planning Runbook

ขั้นตอนเตรียมความพร้อมของระบบก่อนเข้าสู่ high-volatility window ตามที่นิยามไว้ในภาพรวมสถาปัตยกรรม

## 6 สัปดาห์ก่อนเทศกาล

ทีม category ต้องลงทะเบียน promo window ทั้งหมดผ่าน [[business-logic/synthetic-inventory-forecasting/promo-flag-policy]] ให้ครบก่อนช่วงนี้เริ่ม เพื่อให้ [[structure/synthetic-inventory-forecasting/module-seasonality-adjuster]] มีข้อมูลพร้อมปรับค่าล่วงหน้า

## 1 สัปดาห์ก่อนเทศกาล

ตรวจสอบ capacity ของ [[structure/synthetic-inventory-forecasting/module-demand-model-runner]] ให้รองรับปริมาณ shard ที่หนาแน่นขึ้น พิจารณาเพิ่ม replica ล่วงหน้าแทนรอให้ autoscaling ตาม [[deployment/synthetic-inventory-forecasting/scaling-policy]] ตามทัน เพราะช่วงพีคจริงมักมาเร็วกว่าที่ autoscaling ตอบสนองทัน
