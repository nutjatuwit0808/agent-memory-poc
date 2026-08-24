---
layer: business-logic
tags: [fleet, fault, edge-case]
created: 2026-01-02
links:
  - "[[business-logic/synthetic-warehouse-robotics/robot-fault-escalation-policy]]"
---

# กรณี Fault ไม่ต่อเนื่อง (Intermittent) ของหุ่นยนต์

หุ่นยนต์ที่ fault แล้วกลับมาปกติเองซ้ำๆ ภายในเวลาสั้น (เช่น หลุด-กลับมา 3 ครั้งใน 1 ชั่วโมง) ไม่ถูกนับเป็น `critical` เดี่ยวๆ ตามเกณฑ์ปกติ แต่ระบบจะรวมนับเป็นเหตุการณ์เดียวและ escalate ไปให้ทีมซ่อมบำรุงตรวจฮาร์ดแวร์แทน เพราะมักเป็นสัญญาณของสาย connector หลวมมากกว่าเป็นปัญหา software

ระหว่างรอตรวจฮาร์ดแวร์ หุ่นยนต์กลุ่มนี้ยังรับงานได้ปกติถ้าสถานะล่าสุดคือ idle ไม่ใช่ fault — ต่างจาก critical fault ทั่วไปที่หยุดรับงานทันที เพราะ intermittent fault ยังไม่มีหลักฐานว่าจะเกิดซ้ำระหว่างทำงานจริง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-warehouse-robotics/robot-fault-escalation-policy]] ("นโยบายการยกระดับ Fault ของหุ่นยนต์") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
