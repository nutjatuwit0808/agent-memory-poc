---
layer: business-logic
tags: [carbon, edge-case]
created: 2025-11-29
links:
  - "[[business-logic/synthetic-energy-management/carbon-reporting-frequency-policy]]"
---

# ข้อยกเว้นเมื่อข้อมูล Meter ไม่ครบ

ถ้า facility มี meter offline นานเกิน 24 ชั่วโมงในเดือนที่รายงาน ระบบจะสร้างรายงานพร้อม flag ว่าข้อมูลไม่สมบูรณ์ และประมาณการช่วงที่ขาดหายจาก baseline การใช้งานปกติแทน ไม่ใช่ปล่อยรายงานเป็นค่าว่างหรือศูนย์

รายงานที่มี flag ข้อมูลไม่สมบูรณ์จะไม่ถูกใช้เป็นตัวเลขทางการสำหรับการรายงานภายนอก (เช่น รายงานความยั่งยืนต่อผู้ถือหุ้น) จนกว่าทีมอาคารจะยืนยันข้อมูลย้อนหลังให้ครบก่อน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-energy-management/carbon-reporting-frequency-policy]] ("นโยบายความถี่การรายงานคาร์บอนฟุตพรินต์") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
