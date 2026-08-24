---
layer: business-logic
tags: [provisioning, day-one, policy]
created: 2025-12-31
links:
  - "[[structure/synthetic-hr-onboarding/module-access-provisioning]]"
  - "[[business-logic/synthetic-hr-onboarding/day-one-access-policy-edge-cases]]"
---

# นโยบายสิทธิ์การเข้าถึงต้องพร้อมก่อนวันเริ่มงาน

[[structure/synthetic-hr-onboarding/module-access-provisioning]] ต้องขยับสถานะ bundle สิทธิ์ทั้งหมดไป `confirmed` ภายในเวลา 17:00 ของวันทำการก่อนวันเริ่มงานจริงเสมอ ไม่ใช่รอให้ถึงเช้าวันเริ่มงานแล้วค่อยเริ่ม provision

ถ้าถึง deadline แล้วยังมีรายการค้างที่ `queued` หรือ `dispatched` ระบบจะ escalate ไปหาทีม IT ทันทีแบบ manual แทนที่จะรอ queue ประมวลผลตามปกติ เพราะพนักงานใหม่ที่ไม่มี laptop หรือ badge วันแรกกระทบภาพลักษณ์บริษัทโดยตรง

## ทำไมตั้ง deadline ที่ 17:00 วันก่อนหน้า ไม่ใช่เช้าวันเริ่มงาน

ทีม IT ต้องมีเวลาเตรียม laptop จริง (ติดตั้ง software, ตรวจสอบ) และประสานงานกับ reception เรื่อง badge ล่วงหน้า ถ้าปล่อยให้ provisioning เสร็จตอนเช้าวันเริ่มงานพอดี จะไม่เหลือ buffer เวลาให้แก้ปัญหาถ้ามีอะไรพลาด

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-hr-onboarding/day-one-access-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
