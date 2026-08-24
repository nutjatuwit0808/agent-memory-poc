---
layer: business-logic
tags: [occupancy, lighting, edge-case]
created: 2025-11-13
links:
  - "[[support-cases/synthetic-smart-building/case-6109]]"
  - "[[business-logic/synthetic-smart-building/occupancy-based-lighting-policy]]"
---

# ข้อยกเว้นสำหรับห้องประชุมและห้อง Focus Room

ห้องประชุมและ focus room ที่คนมักนั่งนิ่งนานระหว่างพรีเซนต์หรือ video call จะได้ grace period ปิดไฟที่ยาวกว่าปกติ (30 นาทีแทน 10 นาที) และก่อนปิดไฟจริงจะกระพริบไฟเตือน 1 ครั้งเป็นเวลา 5 วินาทีให้คนในห้องมีโอกาสขยับตัวให้ sensor เห็นก่อนเสมอ

ห้องที่เคยเกิดเหตุ false-negative ปิดไฟทั้งที่มีคนอยู่ (ดู [[support-cases/synthetic-smart-building/case-6109]]) จะถูกเพิ่มเข้า watchlist ให้ grace period ยาวขึ้นเป็นพิเศษจนกว่าจะเปลี่ยน sensor รุ่นใหม่ที่ไวกว่า

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-smart-building/occupancy-based-lighting-policy]] ("นโยบายปิดไฟอัตโนมัติตาม Occupancy") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
