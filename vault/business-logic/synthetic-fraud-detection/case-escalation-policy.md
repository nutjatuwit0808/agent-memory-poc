---
layer: business-logic
tags: [case-management, escalation, policy]
created: 2026-06-02
---

# นโยบาย Case Escalation

case ที่ analyst ตรวจสอบแล้วไม่สามารถ resolve ได้ด้วยข้อมูลปัจจุบัน สามารถ escalate ไปยัง senior analyst หรือ risk specialist ได้ พร้อม reason ที่ชัดเจน escalation ไม่ได้ปิด original case แต่สร้าง sub-task ใหม่ที่เชื่อมกัน

case ที่ escalate แล้วยังไม่มีการตัดสินใจสุดท้ายภายใน 24 ชั่วโมง จะถูก auto-assign ให้ Fraud Ops lead โดยอัตโนมัติ เพราะการค้างนานเกินนี้มักหมายความว่าต้องการ policy decision ไม่ใช่แค่ข้อมูลเพิ่มเติม
