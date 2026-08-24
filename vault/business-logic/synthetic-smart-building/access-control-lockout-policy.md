---
layer: business-logic
tags: [access-control, schedule, policy]
created: 2026-05-22
links:
  - "[[structure/synthetic-smart-building/module-access-control-gateway]]"
  - "[[business-logic/synthetic-smart-building/access-control-lockout-policy-edge-cases]]"
---

# นโยบายการล็อก/ปลดล็อกประตูช่วง Schedule พิเศษ

[[structure/synthetic-smart-building/module-access-control-gateway]] รองรับ schedule พิเศษ เช่น fire drill test, holiday lockdown, หรือปิดปรับปรุงชั้น โดยเก็บเป็นตารางแยกจาก access rule ปกติของบัตรพนักงาน

หลักการสำคัญที่สุดคือ schedule พิเศษต้อง **ไม่มีทาง** ทำให้คนออกจากอาคารไม่ได้ในสถานการณ์ฉุกเฉิน — ทุก schedule ที่ตั้งเป็น locked ต้องยัง unlock อัตโนมัติทันทีถ้ามีสัญญาณ fire alarm เข้ามา ไม่ว่า schedule จะตั้งไว้อย่างไรก็ตาม

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-smart-building/access-control-lockout-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
