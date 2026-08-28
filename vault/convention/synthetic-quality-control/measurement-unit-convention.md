---
layer: convention
tags: [measurement, unit]
created: 2026-02-09
links:
  - "[[structure/synthetic-quality-control/module-measurement-collector]]"
---

# Measurement Unit Convention

เครื่องมือวัดแต่ละรุ่นอาจส่งข้อมูลในหน่วยต่างกัน — convention นี้กำหนดว่าต้องแปลงหน่วยก่อนส่งเข้า [[structure/synthetic-quality-control/module-measurement-collector]] เสมอ

## หน่วยมาตรฐาน

มิติ: มิลลิเมตร (mm) ความดัน: kPa อุณหภูมิ: องศาเซลเซียส (°C) น้ำหนัก: กรัม (g) ห้ามส่งหน่วยอื่นเข้าระบบแม้ instrument จะวัดในหน่วยอื่น

## การแปลงหน่วย

ทำใน adapter layer ของ instrument ก่อนส่งเข้า API ไม่ทำในระบบกลาง เพราะ conversion factor ของแต่ละรุ่น instrument ต่างกัน
