---
layer: structure
tags: [inventory-forecasting, forecastiq, boundaries]
created: 2026-05-20
links:
  - "[[structure/synthetic-inventory-forecasting/module-feature-store]]"
  - "[[structure/synthetic-inventory-forecasting/module-demand-model-runner]]"
  - "[[structure/synthetic-inventory-forecasting/module-replenishment-recommender]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-inventory-forecasting/module-feature-store]] เป็นเจ้าของ feature vector ทั้งหมดที่ใช้ป้อนโมเดล ส่วน [[structure/synthetic-inventory-forecasting/module-demand-model-runner]] เป็นเจ้าของผลลัพธ์การพยากรณ์ดิบเท่านั้น ไม่เก็บ feature ซ้ำเองแม้แต่ค่าเดียว เพื่อไม่ให้เกิดปัญหาสองแหล่งความจริง (dual source of truth)

[[structure/synthetic-inventory-forecasting/module-replenishment-recommender]] เป็น service เดียวที่ query ทั้งผลพยากรณ์ที่ปรับฤดูกาลแล้วและตัวเลข inventory position ปัจจุบันจาก ERP พร้อมกันเพื่อคำนวณจำนวนเติมสินค้า — เหตุผลที่ยอมให้ query ข้าม domain แบบนี้ (ผิดหลักทั่วไป) คือการคำนวณจำนวนเติมต้องเห็นทั้ง "ควรมีเท่าไหร่" และ "มีอยู่เท่าไหร่" พร้อมกันในเวลาที่ตัดสินใจ ไม่งั้นจะเกิดการสั่งซื้อซ้ำซ้อนถ้าแยกกันเรียกคนละเวลา
