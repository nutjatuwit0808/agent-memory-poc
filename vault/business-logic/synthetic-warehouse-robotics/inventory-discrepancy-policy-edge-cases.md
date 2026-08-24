---
layer: business-logic
tags: [inventory, audit, edge-case]
created: 2025-11-24
links:
  - "[[business-logic/synthetic-warehouse-robotics/inventory-discrepancy-policy]]"
---

# ข้อยกเว้นเมื่อเกิด Discrepancy ระหว่าง Physical Audit

ระหว่างช่วง physical audit ประจำไตรมาส ระบบจะปิดการแจ้ง discrepancy อัตโนมัติชั่วคราว เพราะสินค้าถูกย้ายด้วยมือจำนวนมากพร้อมกัน การแจ้งเตือนทุกรายการจะท่วมทีมโดยไม่มีประโยชน์ — discrepancy จะถูกสะสมไว้แล้วรายงานเป็นชุดเดียวหลัง audit เสร็จแทน

SKU ที่มีมูลค่าสูง (จัดกลุ่ม `high_value`) ไม่เข้าเงื่อนไขนี้ ยังคงแจ้ง discrepancy ทันทีแม้อยู่ระหว่าง audit เพราะความเสี่ยงสูญหายสูงกว่าความรำคาญจาก alert ที่มากเกินไป

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-warehouse-robotics/inventory-discrepancy-policy]] ("นโยบายจัดการ Inventory Discrepancy") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
