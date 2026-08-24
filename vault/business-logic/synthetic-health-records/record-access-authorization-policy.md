---
layer: business-logic
tags: [access-control, policy]
created: 2026-01-28
links:
  - "[[structure/synthetic-health-records/module-provider-access-control]]"
  - "[[business-logic/synthetic-health-records/record-access-authorization-policy-edge-cases]]"
---

# นโยบายการอนุญาตเข้าถึงเวชระเบียน

แพทย์หรือพยาบาลจะเข้าถึงข้อมูลผู้ป่วยรายใดได้ก็ต่อเมื่อมี care relationship ที่ยัง active อยู่กับผู้ป่วยรายนั้นเท่านั้น ไม่มีการเข้าถึงแบบ role-based กว้างๆ ที่เปิดให้ดูข้อมูลผู้ป่วยทุกคนในระบบ

ทุกการขอเข้าถึงต้องผ่าน [[structure/synthetic-health-records/module-provider-access-control]] แบบ real-time ไม่มีการ cache สิทธิ์ไว้ล่วงหน้าเกิน `ACCESS_CACHE_TTL_SECONDS` วินาที เพื่อให้การเพิกถอนสิทธิ์มีผลเร็วที่สุด

## ทำไมไม่ใช้ role-based access ธรรมดา

ระบบเวชระเบียนต่างจากระบบทั่วไปตรงที่การ "มีสิทธิ์เป็นแพทย์" ไม่ควรแปลว่า "เห็นข้อมูลผู้ป่วยทุกคนได้" — ต้องผูกกับความสัมพันธ์การรักษาจริงเสมอ เพื่อลดพื้นที่เสี่ยงถ้า account ของแพทย์คนใดคนหนึ่งถูกโจมตี

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-health-records/record-access-authorization-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
