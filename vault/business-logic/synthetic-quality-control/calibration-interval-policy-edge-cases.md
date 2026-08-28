---
layer: business-logic
tags: [calibration, instrument, edge-case]
created: 2026-02-25
links:
  - "[[business-logic/synthetic-quality-control/calibration-interval-policy]]"
---

# กรณีเครื่องมือ Calibrate ไม่ทันและสายผลิตยังเดิน

ถ้าเครื่องมือ calibration เกินกำหนดแต่ยังไม่เกิน grace period และไม่มีเครื่องสำรองทดแทนได้ทันที ระบบจะยังรับข้อมูลต่อแต่ flag measurement ทุกรายการว่า "pre-suspension" เพื่อให้ QC engineer ตัดสินใจว่าจะใช้ข้อมูลนั้นหรือไม่

การตัดสินใจใช้ข้อมูล "pre-suspension" ต้องบันทึกเหตุผลและผ่านการอนุมัติจาก QC Manager เสมอ ห้าม pass batch โดยอิงข้อมูลจากเครื่องที่เลย grace period ไปแล้วโดยเด็ดขาด

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-quality-control/calibration-interval-policy]] ("นโยบายช่วงเวลาการ Calibrate เครื่องมือวัด") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
