---
layer: business-logic
tags: [assessment, retake, edge-case]
created: 2026-04-10
links:
  - "[[structure/synthetic-e-learning/module-assessment-engine]]"
  - "[[business-logic/synthetic-e-learning/retake-cooldown-policy]]"
---

# ข้อยกเว้น Cooldown: กรณีเทคนิคขัดข้องระหว่างสอบ

ถ้า session หมดอายุหรือ browser crash ขณะทำข้อสอบโดยไม่ใช่ความตั้งใจของผู้เรียน ผู้เรียนสามารถขอให้ support team reset attempt count ได้ โดยต้องมีหลักฐาน เช่น session log ที่แสดงว่า submit ไม่เสร็จ ไม่ใช่แค่คำบอกเล่า

Support team ต้องตรวจสอบ session log ใน [[structure/synthetic-e-learning/module-assessment-engine]] ก่อน approve reset เสมอ และ reset ที่ approve แล้วต้องถูกบันทึกใน audit log โดยระบุว่า reset เพราะอะไรและใคร approve เพื่อ traceability

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-e-learning/retake-cooldown-policy]] ("นโยบาย Cooldown ก่อน Retake Assessment") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
