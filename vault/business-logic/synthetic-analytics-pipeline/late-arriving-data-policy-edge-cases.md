---
layer: business-logic
tags: [transform, late-data, edge-case]
created: 2025-11-26
links:
  - "[[business-logic/synthetic-analytics-pipeline/late-arriving-data-policy]]"
---

# ข้อยกเว้นเมื่อข้อมูลมาช้าเกิน 48 ชั่วโมง

ข้อมูลที่มาช้าเกิน 48 ชั่วโมงจะไม่ถูกแปลงและโหลดเข้า partition เดิมโดยอัตโนมัติ — ต้องผ่านการอนุมัติ manual backfill จากทีมเจ้าของ dataset ก่อนเสมอ เพราะการแก้ metric ย้อนหลังไกลเกินไปอาจกระทบรายงานที่ผู้บริหารดูไปแล้ว ต้องแจ้งให้รู้ก่อนแก้

dataset ที่จัดกลุ่ม `real_time_sensitive` (ใช้ทำ alert แบบเกือบเรียลไทม์) ไม่เข้าเงื่อนไข 48 ชั่วโมงนี้เลย — ข้อมูลที่มาช้ากว่า 2 ชั่วโมงจะถูกทิ้งแทนที่จะพยายาม backfill เพราะความถูกต้องย้อนหลังของ dataset กลุ่มนี้สำคัญน้อยกว่าความสดของข้อมูลที่ใช้ alert ปัจจุบัน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-analytics-pipeline/late-arriving-data-policy]] ("นโยบายจัดการข้อมูลที่มาถึงช้า") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
