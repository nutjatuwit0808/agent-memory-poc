---
layer: business-logic
tags: [engagement, edge-case]
created: 2026-06-20
links:
  - "[[business-logic/synthetic-social-feed/engagement-dedup-policy]]"
---

# ข้อยกเว้นเมื่อเกิด Network Retry ซ้อนกันหลายรอบ

ถ้า client retry request เดิมซ้ำเกิน 3 ครั้งภายใน dedup window (สังเกตจาก request ID เดียวกัน) ระบบจะถือว่าเป็น network issue ไม่ใช่ user action จริง และไม่นับ engagement เพิ่มแม้แต่ครั้งเดียวจาก batch retry นั้น

share ที่มาจาก third-party integration (เช่น bot แชร์อัตโนมัติ) ไม่เข้าเงื่อนไข dedup แบบ user ทั่วไป — ถูกนับแยกต่างหากด้วย rate limit ของตัวเองเพื่อไม่ให้ปนกับ engagement จริงของมนุษย์

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-social-feed/engagement-dedup-policy]] ("นโยบายการกันนับ Engagement ซ้ำ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
