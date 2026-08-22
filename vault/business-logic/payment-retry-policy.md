---
layer: business-logic
tags: [payment, retry, policy]
created: 2026-04-20
links:
  - "[[structure/module-payment]]"
  - "[[business-logic/fraud-detection-rules]]"
---

# นโยบายการ Retry การชำระเงิน

## เมื่อไหร่ระบบ retry อัตโนมัติ

เฉพาะกรณีที่ error เป็นประเภท "ชั่วคราว" เท่านั้น เช่น `PAYMENT_GATEWAY_TIMEOUT` หรือ network error — ไม่ retry กรณี `PAYMENT_DECLINED` (บัตรถูกปฏิเสธ) เพราะ retry ซ้ำจะได้ผลเหมือนเดิมและอาจทำให้บัตรลูกค้าถูกธนาคารสงสัยว่าโดนขโมย

## จำนวนครั้งและช่วงเวลา

`MAX_RETRY_ATTEMPTS = 3` (ดูค่าคงที่ที่ [[structure/module-payment]]) ด้วย exponential backoff: รอ 2 วินาที, 8 วินาที, 32 วินาที ตามลำดับ ถ้าครบ 3 ครั้งยังไม่สำเร็จ order จะเข้าสถานะ `payment_failed` และแจ้งลูกค้าให้ลองวิธีชำระเงินอื่น

## ความสัมพันธ์กับการตรวจจับ fraud

retry ที่ถี่เกินไปหรือมาจาก pattern ผิดปกติจะถูกตรวจสอบโดย [[business-logic/fraud-detection-rules]] แยกต่างหาก — นโยบายนี้ควบคุมเฉพาะ retry ที่ระบบ backend สั่งเองเท่านั้น ไม่เกี่ยวกับพฤติกรรมกดปุ่มซ้ำของลูกค้าที่หน้าเว็บ
