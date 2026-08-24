---
layer: business-logic
tags: [template, edge-case]
created: 2025-10-14
links:
  - "[[business-logic/synthetic-document-signing/template-merge-field-policy]]"
---

# ข้อยกเว้นสำหรับ Merge Field ที่ตั้งใจให้เป็น Optional

merge field ที่ประกาศเป็น `optional` ตอนสร้าง template (เช่น เลขที่ห้องในที่อยู่ที่บางบริษัทไม่มี) สามารถเว้นว่างได้โดย `renderTemplate` จะแทนที่ด้วยสตริงว่างแทนที่จะ throw error — field ประเภทนี้ต้องระบุไว้ตั้งแต่ตอน `createTemplate` เท่านั้น เปลี่ยนภายหลังไม่ได้เพื่อไม่ให้ template เดิมที่เคย render ไปแล้วมีความหมายเปลี่ยนไป

field ที่เกี่ยวกับตัวเลขทางการเงิน (จำนวนเงิน, วันที่ครบกำหนด) ห้ามตั้งเป็น optional เด็ดขาดไม่ว่ากรณีใด แม้ผู้สร้าง template จะพยายามตั้งก็ตาม ระบบปฏิเสธการตั้งค่านี้ตั้งแต่ชั้น validation

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-document-signing/template-merge-field-policy]] ("นโยบายการจัดการ Merge Field ที่ไม่ถูกกรอก") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
