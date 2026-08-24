---
layer: business-logic
tags: [provisioning, remote, edge-case]
created: 2025-09-19
links:
  - "[[business-logic/synthetic-hr-onboarding/day-one-access-policy]]"
---

# ข้อยกเว้นเมื่อพนักงานใหม่เริ่มงานแบบ remote-first

พนักงานที่ onboarding แบบ remote (ไม่ต้องเข้าออฟฟิศวันแรก) ไม่ต้องมี badge พร้อมก่อน deadline — ระบบจะตัด `badge` ออกจาก bundle ที่ต้องผ่านเงื่อนไข day-one อัตโนมัติ แต่ยังคงบังคับ `laptop` และ `software` เหมือนเดิมเพราะจำเป็นต่อการทำงานตั้งแต่วันแรก

สำหรับ remote hire ที่ต้อง ship laptop ทางไปรษณีย์ deadline การ `dispatched` ขยับเป็น 5 วันทำการก่อนวันเริ่มงานแทน 17:00 วันก่อนหน้า เพื่อให้มีเวลาจัดส่งเพียงพอ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-hr-onboarding/day-one-access-policy]] ("นโยบายสิทธิ์การเข้าถึงต้องพร้อมก่อนวันเริ่มงาน") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
