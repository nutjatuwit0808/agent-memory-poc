---
layer: business-logic
tags: [budget, pacing, edge-case]
created: 2025-10-30
links:
  - "[[business-logic/synthetic-ad-bidding/budget-pacing-policy]]"
---

# ข้อยกเว้นเมื่อแคมเปญใกล้หมด Budget ในนาทีสุดท้ายของวัน

ในช่วง 30 นาทีสุดท้ายก่อนสิ้นวัน (ตาม timezone ของแคมเปญ) ระบบจะปิด pacing throttle ชั่วคราวสำหรับแคมเปญที่ยังมี budget เหลือมากกว่า 10% เพื่อให้ใช้ budget ที่เหลือให้หมดตามที่ตั้งใจไว้ แทนที่จะถือ budget ทิ้งไว้ข้ามวันโดยไม่มีเหตุผล

กฎนี้ไม่ใช้กับแคมเปญที่ตั้งค่า `strict_pacing: true` (ปกติเป็นแคมเปญ brand ที่ต้องการกระจายการแสดงผลสม่ำเสมอมากกว่าการใช้ budget ให้หมด) กลุ่มนี้ปล่อยให้ budget เหลือข้ามวันได้ตามปกติ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-ad-bidding/budget-pacing-policy]] ("นโยบาย Pacing การใช้ Budget แคมเปญ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
