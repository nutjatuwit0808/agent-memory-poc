---
layer: business-logic
tags: [invoice, edge-case]
created: 2025-10-25
links:
  - "[[business-logic/synthetic-subscription-billing/invoice-due-date-calculation-policy]]"
---

# ข้อยกเว้นเมื่อลูกค้าอยู่ระหว่างกระบวนการ Dunning

ใบแจ้งหนี้ใหม่ที่ออกให้ลูกค้าที่ยังอยู่ระหว่างกระบวนการ dunning จากใบแจ้งหนี้ก่อนหน้า จะมีกำหนดชำระสั้นกว่าปกติ (7 วันแทน 15 วัน) เพื่อไม่ให้ยอดค้างชำระสะสมนานเกินไปก่อนที่จะตัดสินใจระงับบริการ

กฎนี้ใช้เฉพาะลูกค้าที่มีใบแจ้งหนี้ค้างชำระจริงเท่านั้น ไม่ใช้กับลูกค้าที่เคยมีประวัติ dunning ในอดีตแต่ปัจจุบันชำระตรงเวลาปกติแล้ว

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-subscription-billing/invoice-due-date-calculation-policy]] ("นโยบายการคำนวณวันครบกำหนดชำระ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
