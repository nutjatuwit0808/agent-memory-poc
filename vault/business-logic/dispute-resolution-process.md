---
layer: business-logic
tags: [dispute, chargeback, support]
created: 2026-04-18
links:
  - "[[business-logic/refund-policy]]"
  - "[[business-logic/fraud-detection-rules]]"
---

# กระบวนการจัดการข้อพิพาท (Dispute / Chargeback)

## ความแตกต่างจากการคืนเงินปกติ

dispute เกิดเมื่อลูกค้าติดต่อธนาคาร/ผู้ออกบัตรโดยตรงเพื่อขอเงินคืน (chargeback) แทนที่จะขอผ่านระบบ PayFlow ตาม [[business-logic/refund-policy]] — เมื่อเกิดกรณีนี้ ธนาคารจะหักเงินคืนจากร้านค้าทันทีโดยที่ระบบยังไม่ทันได้ตรวจสอบอะไรเลย

## ขั้นตอนเมื่อได้รับแจ้ง dispute

1. payment gateway ส่ง webhook แจ้งเข้ามาพร้อมเลข dispute reference
2. order ที่เกี่ยวข้องถูก mark เป็น `disputed` ทันที ไม่กระทบสถานะการจัดส่งที่กำลังดำเนินอยู่
3. ทีม support รวบรวมหลักฐาน (การจัดส่งสำเร็จ, การสื่อสารกับลูกค้า) ส่งกลับให้ payment gateway ภายใน deadline ที่ธนาคารกำหนด (ปกติ 7-10 วัน)
4. ถ้าธนาคารตัดสินให้ร้านค้าชนะ เงินจะถูกคืนกลับมา แต่กระบวนการใช้เวลาหลายสัปดาห์

## ความสัมพันธ์กับ fraud detection

order ที่เคยถูก [[business-logic/fraud-detection-rules]] flag ไว้ก่อนหน้า มีโอกาสเกิด dispute สูงกว่าค่าเฉลี่ยอย่างมีนัยสำคัญ ทีม risk ใช้ข้อมูลนี้ปรับ threshold การ flag อยู่เรื่อยๆ
