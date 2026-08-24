---
layer: business-logic
tags: [access-control, edge-case]
created: 2026-06-05
links:
  - "[[business-logic/synthetic-health-records/record-access-authorization-policy]]"
---

# ข้อยกเว้นเมื่อแพทย์ Consult ข้ามแผนก

เมื่อแพทย์เจ้าของไข้ขอ consult จากแพทย์แผนกอื่น ระบบจะสร้าง care relationship ชั่วคราวให้แพทย์ที่ถูก consult อัตโนมัติ มีอายุ 72 ชั่วโมงแล้วหมดอายุเองโดยไม่ต้องมีใครเพิกถอนด้วยมือ

การ consult ข้ามแผนกทุกครั้งต้องระบุเหตุผลก่อนสร้างความสัมพันธ์ชั่วคราวได้ ไม่มีการอนุมัติแบบไม่มีเหตุผลประกอบเด็ดขาด และเหตุผลนี้จะถูกบันทึกลง audit log ควบคู่กับสิทธิ์ที่มอบให้

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-health-records/record-access-authorization-policy]] ("นโยบายการอนุญาตเข้าถึงเวชระเบียน") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
