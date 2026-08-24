---
layer: business-logic
tags: [buddy, edge-case]
created: 2025-09-02
links:
  - "[[business-logic/synthetic-hr-onboarding/buddy-assignment-policy]]"
---

# ข้อยกเว้นเมื่อไม่มี Buddy ที่ตรงเงื่อนไขในทีมเดียวกัน

ถ้า department ของพนักงานใหม่มีคนน้อยเกินไปจนหา buddy ที่ผ่านเงื่อนไข timezone overlap ไม่ได้เลย ระบบจะขยายขอบเขตการค้นหาไปยัง department ใกล้เคียงที่ทำงานร่วมกันบ่อย (cross-functional partner team) แทนที่จะปล่อยให้ไม่มี buddy เลย

ถ้าขยายขอบเขตแล้วยังหาไม่ได้ภายใน 3 วันทำการ ระบบจะแจ้งหัวหน้างานให้เสนอชื่อ buddy เองด้วยมือ แทนที่จะรอ algorithm ต่อไปเรื่อยๆ โดยไม่มีกำหนด

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-hr-onboarding/buddy-assignment-policy]] ("นโยบายเงื่อนไขการจับคู่ Buddy") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
