---
layer: business-logic
tags: [appeal, false-positive, auto-approval, edge-case]
created: 2025-11-22
links:
  - "[[support-cases/synthetic-fraud-detection/case-7261]]"
  - "[[business-logic/synthetic-fraud-detection/false-positive-appeal-policy]]"
---

# Auto-Approval ของ Appeal ที่มีหลักฐานชัดเจน

appeal บางประเภทสามารถ auto-approve ได้โดยไม่ต้องให้ analyst ดู ถ้าตรงเงื่อนไขทั้งหมด: block เกิดจาก rule เดียว (ไม่ใช่ ML score), rule นั้น block เพราะ velocity threshold, และ velocity counter reset ในภายหลัง (บ่งบอกว่าเป็น burst ชั่วคราว ไม่ใช่ pattern ต่อเนื่อง)

ห้าม auto-approve appeal ที่ ML score เกิน 60 ไม่ว่ากรณีใดทั้งสิ้น เพราะ ML score สูงบ่งบอกถึง behavioral pattern ที่ต้องการ human judgment เสมอ ดูบทเรียนจาก [[support-cases/synthetic-fraud-detection/case-7261]]

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-fraud-detection/false-positive-appeal-policy]] ("นโยบายการ Appeal กรณี False Positive") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
