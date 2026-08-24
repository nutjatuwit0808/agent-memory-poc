---
layer: business-logic
tags: [access-control, fire-drill, edge-case]
created: 2025-12-19
links:
  - "[[support-cases/synthetic-smart-building/case-7700]]"
  - "[[business-logic/synthetic-smart-building/access-control-lockout-policy]]"
---

# ข้อยกเว้นเมื่อ Fire Drill Test ทับซ้อนกับ Schedule ล็อกพื้นที่จริง

ถ้า fire drill test ที่ตั้งเวลาไว้ล่วงหน้าทับซ้อนกับช่วงเวลาที่มี schedule ล็อกพื้นที่จริง (เช่น พื้นที่ปิดปรับปรุง) ระบบต้องปลดล็อกประตูทางออกฉุกเฉินเสมอในช่วง drill แม้พื้นที่นั้นจะถูกตั้งเป็น locked ไว้ — ประตูภายในที่ไม่ใช่ทางออกฉุกเฉินยังคง locked ตาม schedule เดิมได้

การแยกแยะว่าประตูไหนเป็น "ทางออกฉุกเฉิน" ต้องตั้ง flag `isEmergencyEgress` ไว้ล่วงหน้าในระบบเสมอ ไม่ใช่ตัดสินใจตอน runtime — เหตุการณ์ [[support-cases/synthetic-smart-building/case-7700]] เกิดขึ้นเพราะ drill schedule ที่สร้างใหม่ไม่ได้ query flag นี้ก่อนล็อก ทำให้ล็อกประตูทางออกฉุกเฉินไปด้วยโดยไม่ตั้งใจ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-smart-building/access-control-lockout-policy]] ("นโยบายการล็อก/ปลดล็อกประตูช่วง Schedule พิเศษ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
