---
layer: business-logic
tags: [scheduling, policy]
created: 2026-05-22
links:
  - "[[business-logic/synthetic-health-records/appointment-no-show-policy-edge-cases]]"
---

# นโยบายการไม่มาตามนัด (No-show)

ผู้ป่วยที่ไม่มาตามนัดโดยไม่แจ้งล่วงหน้าเกิน 3 ครั้งในรอบ 6 เดือน จะถูกระบบแจ้งเตือนพิเศษให้เจ้าหน้าที่ติดต่อยืนยันก่อนรับนัดครั้งถัดไป

การยกเลิกนัดล่วงหน้าน้อยกว่า 2 ชั่วโมงก่อนเวลานัดถือเป็น no-show เช่นกัน ไม่ใช่แค่การไม่มาแบบไม่แจ้งเลย เพราะ slot ที่ว่างกะทันหันมักหาผู้ป่วยรายอื่นมาแทนไม่ทัน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-health-records/appointment-no-show-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
