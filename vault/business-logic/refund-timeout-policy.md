---
layer: business-logic
tags: [refund, timeout, policy]
created: 2026-03-18
links:
  - "[[business-logic/refund-policy]]"
  - "[[structure/module-refund]]"
  - "[[deployment/connection-timeout-tuning]]"
---

# นโยบาย Timeout ของการคืนเงิน (Business-level)

เอกสารนี้พูดถึง **timeout ระดับ business** — ระยะเวลาที่ระบบยอมให้คำขอคืนเงินอยู่ในสถานะ `processing` ก่อนจะถือว่า "ค้าง" ไม่ใช่ timeout ระดับ connection/network ซึ่งเป็นคนละเรื่องที่อธิบายไว้ใน [[deployment/connection-timeout-tuning]]

## นิยาม "ค้าง" (stuck)

คำขอคืนเงินที่อยู่ในสถานะ `processing` เกิน `REFUND_STUCK_THRESHOLD_MIN` (ค่าปกติ 15 นาที) นับเป็น stuck โดยอัตโนมัติ ระบบจะ:

1. เปลี่ยนสถานะภายในเป็น `stuck` (ลูกค้ายังเห็นเป็น "กำลังดำเนินการ")
2. ส่ง notification ภายในหาทีม support (template `refund-stuck-internal`)
3. ไม่ retry อัตโนมัติ — ต้องมีคนตรวจก่อนว่าเงินถูกตัดที่ payment gateway จริงหรือไม่ เพื่อป้องกันการคืนเงินซ้ำสอง

## สาเหตุที่พบบ่อยที่สุด

payment gateway ไม่ส่ง webhook ยืนยันกลับมาภายในเวลาที่คาด (คนละเรื่องกับ connection timeout ที่ตัด request ตั้งแต่ต้นทาง — กรณีนี้ request ไปถึง gateway แล้ว แค่ gateway ตอบช้า) ดูตัวอย่างเหตุการณ์จริงที่ [[deployment/incident-response-runbook]]

## ทำไมต้องแยก policy นี้จาก refund-policy หลัก

`refund-policy` (ดู [[business-logic/refund-policy]]) ตอบคำถามว่า "ลูกค้ามีสิทธิ์คืนเงินไหม" ส่วนเอกสารนี้ตอบคำถามว่า "คืนเงินที่อนุมัติแล้วแต่ทำไมยังไม่เสร็จ" สองคำถามนี้แยกกันชัดเจนและทีม support ต้องแยกแยะให้ถูกก่อนตอบลูกค้า เพราะวิธีแก้ต่างกันคนละแบบ
