---
layer: business-logic
tags: [dispatch, timeout, stale-assignment, edge-case]
created: 2026-01-12
links:
  - "[[business-logic/synthetic-food-delivery/driver-payout-calculation-policy]]"
  - "[[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy]]"
---

# กรณีคนขับยืนยันรับแต่ไม่ขยับไปร้านภายในเวลาที่กำหนด

คนขับที่ยืนยันรับออร์เดอร์แล้วแต่ไม่มีการอัปเดตตำแหน่งเข้าใกล้ร้านเลยภายใน 10 นาที ระบบจะ flag เป็น `stale_assignment` และแจ้ง ops team โดยอัตโนมัติ จากนั้น ops มีสิทธิ์ reassign ออร์เดอร์ได้โดยไม่ต้องรอให้คนขับยกเลิกเอง

การ reassign แบบนี้จะ trigger การคำนวณ payout ให้คนขับเดิมด้วยว่าจะได้ค่า cancellation compensation หรือไม่ ขึ้นอยู่กับว่าสาเหตุที่ไม่ขยับเป็นเพราะ driver fault หรือ system issue ดู [[business-logic/synthetic-food-delivery/driver-payout-calculation-policy]]

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy]] ("นโยบาย Timeout การยืนยันรับออร์เดอร์ของคนขับ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
