---
layer: business-logic
tags: [rule-engine, approval, emergency, edge-case]
created: 2026-05-21
links:
  - "[[business-logic/synthetic-fraud-detection/rule-override-approval-policy]]"
---

# Emergency Override เมื่อ Rule ทำให้ False Positive พุ่งวิกฤต

ในกรณีที่ rule ทำให้ false positive rate พุ่งเกิน 15% ภายในช่วงเวลาสั้น (ซึ่งกระทบลูกค้าจริงจำนวนมาก) on-call lead มีสิทธิ์ temporary disable rule ได้ทันทีโดยไม่ต้องรอ approval ล่วงหน้า แต่ต้องส่งไฟล์ notification ให้ทีม Risk ภายใน 15 นาทีหลังดำเนินการ

การ emergency disable จะมีอายุ 4 ชั่วโมงเท่านั้นก่อน auto-reenable อัตโนมัติ เพื่อบังคับให้มีการ decision สุดท้ายจากทีม Risk ก่อนที่ disable จะมีผลถาวร

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-fraud-detection/rule-override-approval-policy]] ("นโยบายการ Override Rule และการอนุมัติ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
