---
layer: business-logic
tags: [driver, rating, appeal, edge-case]
created: 2025-11-16
links:
  - "[[support-cases/synthetic-food-delivery/case-5438]]"
  - "[[business-logic/synthetic-food-delivery/driver-rating-threshold-policy]]"
---

# คนขับ Rating ต่ำเพราะ Incident ที่ระบบยืนยันแล้วว่าไม่ใช่ความผิดคนขับ

ถ้าลูกค้า rate ต่ำเพราะ ETA ผิดพลาดจาก traffic data outage (ดู [[support-cases/synthetic-food-delivery/case-5438]]) หรือเพราะร้านเตรียมอาหารช้ากว่าที่แจ้ง ทีม ops มีสิทธิ์ flag rating นั้นเป็น `platform_caused` และ exclude ออกจากการคำนวณค่าเฉลี่ยของคนขับ

กระบวนการ appeal ต้องทำภายใน 72 ชั่วโมงหลังออร์เดอร์ deliver สำเร็จ คนขับต้องส่ง request ผ่านแอปก่อน ops จะมีข้อมูลออร์เดอร์นั้นปรากฏใน review queue

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-food-delivery/driver-rating-threshold-policy]] ("นโยบาย Rating Threshold สำหรับคนขับ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
