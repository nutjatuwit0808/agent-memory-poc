---
layer: business-logic
tags: [replenishment, override, policy]
created: 2026-07-29
links:
  - "[[business-logic/synthetic-inventory-forecasting/forecast-override-policy-edge-cases]]"
---

# นโยบายการ Override ค่าพยากรณ์โดย Analyst

Analyst สามารถแก้จำนวนเติมสินค้าที่ระบบแนะนำด้วยมือผ่าน `applyAnalystOverride` ได้เสมอ โดยต้องระบุเหตุผลประกอบทุกครั้ง (เช่น รู้ข้อมูล promo ที่ระบบยังไม่เห็น หรือข้อจำกัดด้าน shelf space ที่ระบบไม่รู้จัก)

ค่า override ถือเป็น "ความจริงล่าสุด" และมี priority สูงกว่าค่าที่ระบบคำนวณเองเสมอ จนกว่าจะหมดอายุหรือถูกยกเลิกด้วยมือ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-inventory-forecasting/forecast-override-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
