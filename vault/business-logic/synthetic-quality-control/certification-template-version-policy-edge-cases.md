---
layer: business-logic
tags: [certification, template, edge-case]
created: 2026-04-28
links:
  - "[[business-logic/synthetic-quality-control/certification-template-version-policy]]"
---

# กรณีลูกค้า Approve Template เวอร์ชันใหม่ระหว่าง Shipment ค้างอยู่

ถ้าลูกค้า approve template version ใหม่ในขณะที่มี batch รอ certification อยู่แล้ว batch เหล่านั้นยังคงใช้ template version ที่ approved ณ เวลาที่ขอ certification ได้ ไม่บังคับให้ reissue ด้วย version ใหม่

ยกเว้นกรณีที่ template version เก่าถูก revoke ออกจาก approved list (ไม่ใช่แค่เพิ่ม version ใหม่เข้ามา) — กรณีนี้ batch ที่ยังไม่ได้รับ certification ต้องรอจนกว่าจะออก certification ด้วย version ที่ยังอยู่ใน approved list เท่านั้น

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-quality-control/certification-template-version-policy]] ("นโยบายเวอร์ชัน Template ใบรับรอง") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
