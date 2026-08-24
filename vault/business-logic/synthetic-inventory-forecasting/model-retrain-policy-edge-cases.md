---
layer: business-logic
tags: [forecasting, retrain, edge-case]
created: 2026-02-15
links:
  - "[[business-logic/synthetic-inventory-forecasting/cold-start-fallback-policy]]"
  - "[[business-logic/synthetic-inventory-forecasting/model-retrain-policy]]"
---

# ข้อยกเว้นของนโยบาย Retrain ช่วงโปรโมชันใหญ่และ SKU ใหม่

ระหว่าง high-volatility window (6 สัปดาห์ก่อนเทศกาลใหญ่ถึง 1 สัปดาห์หลังจบ) ระบบจะไม่ trigger retrain อัตโนมัติแม้ WAPE จะเกิน threshold เพราะข้อมูลช่วงนี้ผันผวนจากผลของโปรโมชันเป็นหลัก ไม่ใช่สัญญาณว่าโมเดล base ผิดพลาด การ retrain ด้วยข้อมูลช่วงนี้เสี่ยงทำให้โมเดล overfit กับ promo effect เพียงอย่างเดียว

SKU ที่เพิ่งผ่าน cold-start period ตาม [[business-logic/synthetic-inventory-forecasting/cold-start-fallback-policy]] ไม่นับรวมใน accuracy metric ที่ใช้ตัดสิน retrain จนกว่าจะมีประวัติยอดขายจริงอย่างน้อย 8 สัปดาห์ เพราะช่วง cold-start ใช้ค่า fallback ที่รู้อยู่แล้วว่าไม่แม่นยำเท่าโมเดลที่มีข้อมูลเพียงพอ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-inventory-forecasting/model-retrain-policy]] ("นโยบายการ Retrain โมเดลพยากรณ์") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
