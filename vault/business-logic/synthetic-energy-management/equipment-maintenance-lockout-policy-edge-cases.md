---
layer: business-logic
tags: [scheduling, safety, edge-case]
created: 2026-07-24
links:
  - "[[business-logic/synthetic-energy-management/equipment-maintenance-lockout-policy]]"
---

# ข้อยกเว้นเมื่อเกิดเหตุฉุกเฉินระหว่าง Lockout

ถ้าเกิดสถานการณ์ฉุกเฉินที่ต้องการควบคุมอุปกรณ์ที่อยู่ใน lockout (เช่น ไฟไหม้ต้องการปิดระบบระบายอากาศเฉพาะจุด) ทีมความปลอดภัยมีสิทธิ์ override lockout ได้ทันทีผ่านช่องทางฉุกเฉินที่แยกจากการควบคุมปกติ

การ override lockout ทุกครั้งต้องแจ้งทีมบำรุงรักษาทันทีเพื่อประเมินว่างานบำรุงรักษาที่กำลังทำอยู่ปลอดภัยที่จะดำเนินต่อหรือต้องหยุดชั่วคราว ไม่ใช่ปล่อยให้ทีมบำรุงรักษาไม่รู้ตัวว่าอุปกรณ์ถูกควบคุมระหว่างที่ตัวเองกำลังทำงานอยู่

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-energy-management/equipment-maintenance-lockout-policy]] ("นโยบายการล็อกอุปกรณ์ระหว่างบำรุงรักษา") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
