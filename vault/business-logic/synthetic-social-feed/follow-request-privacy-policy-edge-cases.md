---
layer: business-logic
tags: [follow, edge-case]
created: 2026-03-02
links:
  - "[[business-logic/synthetic-social-feed/follow-request-privacy-policy]]"
---

# ข้อยกเว้นเมื่อผู้ขอเคย Follow มาก่อนแล้ว Unfollow

ถ้าผู้ขอเคย follow บัญชีนี้สำเร็จมาก่อนแล้ว unfollow เอง และส่งคำขอใหม่ภายใน 24 ชั่วโมง ระบบจะอนุมัติอัตโนมัติทันทีโดยไม่ต้องรอเจ้าของบัญชี เพราะถือว่าเคยผ่านการอนุมัติมาแล้วในช่วงเวลาใกล้กัน

ถ้าเจ้าของบัญชี block ผู้ขอไปแล้วในอดีต ข้อยกเว้นข้างต้นจะไม่มีผลเลย ต้องผ่านการอนุมัติด้วยมือเสมอไม่ว่าจะเคย follow มาก่อนแค่ไหน เพราะการ block เป็นสัญญาณที่ชัดเจนกว่าประวัติการ follow เก่า

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-social-feed/follow-request-privacy-policy]] ("นโยบายการอนุมัติคำขอ Follow บัญชี Private") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
