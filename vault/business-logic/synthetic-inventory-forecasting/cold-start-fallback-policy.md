---
layer: business-logic
tags: [forecasting, cold-start, policy]
created: 2026-01-24
links:
  - "[[business-logic/synthetic-inventory-forecasting/cold-start-fallback-policy-edge-cases]]"
---

# นโยบายพยากรณ์สินค้าใหม่ (Cold Start)

SKU ที่ยังไม่มีประวัติยอดขายของตัวเอง (สินค้าใหม่) ใช้ค่าเฉลี่ยของ category เดียวกัน (`categoryAvgFallback`) เป็นพยากรณ์เริ่มต้นในช่วง 8 สัปดาห์แรก แล้วค่อยๆ blend สัดส่วนของสัญญาณจริงของ SKU นั้นเข้ามาแทนที่ทีละสัปดาห์

สัดส่วนการ blend คำนวณจากจำนวนสัปดาห์ที่มีข้อมูลจริงแล้ว หาร 8 (เช่น สัปดาห์ที่ 3 ใช้สัญญาณจริง 3/8 และ fallback 5/8) เพื่อไม่ให้พยากรณ์กระโดดแรงเกินไปตอนสัญญาณจริงยังมีน้อย

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-inventory-forecasting/cold-start-fallback-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
