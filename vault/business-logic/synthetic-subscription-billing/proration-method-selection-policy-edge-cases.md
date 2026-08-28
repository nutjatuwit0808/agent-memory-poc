---
layer: business-logic
tags: [proration, edge-case]
created: 2025-11-21
links:
  - "[[business-logic/synthetic-subscription-billing/proration-method-selection-policy]]"
---

# ข้อยกเว้นเมื่อเปลี่ยนแพลนข้ามรอบบิลที่มีความยาวต่างกัน

ถ้าเปลี่ยนจากแพลนรายเดือนไปแพลนรายปี (หรือกลับกัน) กลางรอบบิล การคำนวณ proration จะใช้วิธี `daily` เสมอไม่ว่าแพลนต้นทางหรือปลายทางจะกำหนดวิธี `monthly` ไว้ก็ตาม เพราะรอบบิลที่มีความยาวต่างกันไม่สามารถเทียบเป็นสัดส่วนเดือนได้อย่างยุติธรรม

ยอด proration ที่คำนวณได้ต่ำกว่า `MIN_PRORATION_AMOUNT_THB` จะถูกปัดเป็นศูนย์ไม่เรียกเก็บหรือคืนเงิน เพื่อไม่ให้เกิดรายการเก็บเงินจำนวนน้อยมากที่สร้างความสับสนมากกว่าประโยชน์ที่ได้

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-subscription-billing/proration-method-selection-policy]] ("นโยบายการเลือกวิธีคำนวณ Proration") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
