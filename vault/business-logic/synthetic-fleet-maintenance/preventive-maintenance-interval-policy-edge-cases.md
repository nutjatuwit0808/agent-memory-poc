---
layer: business-logic
tags: [maintenance, interval, edge-case]
created: 2026-04-21
links:
  - "[[business-logic/synthetic-fleet-maintenance/preventive-maintenance-interval-policy]]"
---

# ข้อยกเว้นสำหรับยานพาหนะที่ใช้งานน้อยผิดปกติ

ยานพาหนะที่วิ่งน้อยกว่า 500 กม. ต่อเดือนอย่างต่อเนื่อง (เช่น รถสำรองที่ไม่ค่อยได้ใช้) จะถูก cap ไว้ที่ time-based trigger เท่านั้น ไม่ต้องรอให้ odometer ครบ เพราะน้ำมันเครื่องและชิ้นส่วนยังเสื่อมสภาพตามเวลาแม้จะวิ่งน้อย

กรณีนี้ระบบจะ override odometer trigger อัตโนมัติโดยไม่แจ้งผู้ใช้ แต่จะบันทึกใน maintenance history ว่า trigger มาจาก time-based แทน odometer เพื่อให้ audit trail ชัดเจน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-fleet-maintenance/preventive-maintenance-interval-policy]] ("นโยบายช่วงเวลาบำรุงรักษาเชิงป้องกัน") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
