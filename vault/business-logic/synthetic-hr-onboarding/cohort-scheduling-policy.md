---
layer: business-logic
tags: [cohort, scheduling, policy]
created: 2025-09-27
links:
  - "[[business-logic/synthetic-hr-onboarding/day-one-access-policy]]"
---

# นโยบายการจัดกลุ่มวันเริ่มงาน (Cohort)

บริษัทกำหนดวันเริ่มงานพนักงานใหม่เป็นรอบคงที่ (ทุกวันจันทร์แรกและวันจันทร์ที่สามของเดือน) เพื่อให้ทีม HR และ IT เตรียมงานเป็นชุดแทนที่จะกระจายทุกวัน

case ที่ถูกสร้างใกล้วัน cohort เกินไป (น้อยกว่า 5 วันทำการ) ระบบจะเตือน HR ทันทีว่าอาจ provisioning ไม่ทัน day-one deadline ตาม [[business-logic/synthetic-hr-onboarding/day-one-access-policy]]
