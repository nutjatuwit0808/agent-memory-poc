---
layer: business-logic
tags: [instructor, scheduling, emergency, edge-case]
created: 2026-04-13
links:
  - "[[business-logic/synthetic-e-learning/instructor-conflict-resolution-policy]]"
---

# ข้อยกเว้น Conflict Resolution: Instructor ป่วยฉุกเฉิน

ถ้า instructor แจ้งป่วยฉุกเฉินภายใน 2 ชั่วโมงก่อน session เริ่ม ระบบอนุญาตให้ scheduling admin assign instructor สำรองได้โดยข้าม conflict check ชั่วคราว เพื่อให้แก้ปัญหาได้ทันเวลา แต่ต้องไม่มี conflict ที่ยังค้างอยู่หลัง session จบ

กรณีไม่มี instructor สำรองที่ว่าง session จะถูก postpone และผู้เรียนที่ enroll จะได้รับแจ้งทันทีพร้อม session ทดแทนที่ทาง LMS จัดให้ใหม่ภายใน 48 ชั่วโมง ไม่ยกเลิก session โดยไม่มีทางออกให้ผู้เรียน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-e-learning/instructor-conflict-resolution-policy]] ("นโยบายการแก้ไข Conflict ตารางสอนของ Instructor") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
