---
layer: business-logic
tags: [replenishment, override, edge-case]
created: 2026-02-13
links:
  - "[[business-logic/synthetic-inventory-forecasting/backfill-policy]]"
  - "[[business-logic/synthetic-inventory-forecasting/forecast-override-policy]]"
---

# ข้อยกเว้นเมื่อ Override หมดอายุหรือถูกงานอื่นแตะ

Override มีอายุ 21 วันนับจากวันที่ตั้งค่า หากเกินกำหนดโดยไม่มีการยืนยันซ้ำ ระบบจะกลับไปใช้ค่าที่คำนวณอัตโนมัติแทน เพื่อไม่ให้ override เก่าที่บริบทเปลี่ยนไปแล้วค้างอยู่ถาวรโดยไม่มีใครทบทวน

งาน backfill หรือ batch job ใดๆ ที่เขียนทับ `replenishment_recommendations` ต้อง preserve แถวที่ `source = "analyst_override"` เสมอ ห้ามเขียนทับด้วยค่าระบบโดยไม่ผ่านการตรวจสอบก่อน — ดู [[business-logic/synthetic-inventory-forecasting/backfill-policy]] สำหรับกลไกป้องกันที่ใช้จริง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-inventory-forecasting/forecast-override-policy]] ("นโยบายการ Override ค่าพยากรณ์โดย Analyst") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
