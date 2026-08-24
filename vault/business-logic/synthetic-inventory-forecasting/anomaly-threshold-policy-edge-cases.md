---
layer: business-logic
tags: [anomaly, promo, edge-case]
created: 2026-06-27
links:
  - "[[business-logic/synthetic-inventory-forecasting/promo-flag-policy]]"
  - "[[business-logic/synthetic-inventory-forecasting/anomaly-threshold-policy]]"
---

# ข้อยกเว้นสำหรับ SKU ที่อยู่ในช่วงโปรโมชัน

SKU ที่มี `promoFlag = true` ตาม [[business-logic/synthetic-inventory-forecasting/promo-flag-policy]] ใช้ threshold ที่ผ่อนปรนกว่าปกติ (z-score 4.0 แทน 2.5) เพราะยอดขายพุ่งช่วงโปรโมชันเป็นเรื่องคาดหวังอยู่แล้ว ไม่ใช่ความผิดปกติ — การใช้ threshold ปกติกับ SKU โปรโมชันเคยทำให้เกิด false positive จำนวนมากท่วมคิวตรวจสอบ

แต่ถ้า SKU โปรโมชันมียอดขาย "ต่ำกว่า" พยากรณ์ผิดปกติ (ไม่ใช่สูงกว่า) จะยังคง flag ด้วย threshold ปกติเสมอ เพราะการขายไม่ออกทั้งที่มีโปรโมชันสนับสนุนเป็นสัญญาณสำคัญที่ไม่ควรถูกกลบด้วย threshold ที่ผ่อนปรน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-inventory-forecasting/anomaly-threshold-policy]] ("นโยบายกำหนด Threshold ความผิดปกติของยอดขาย") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
