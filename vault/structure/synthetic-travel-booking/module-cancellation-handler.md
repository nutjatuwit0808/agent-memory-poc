---
layer: structure
tags: [cancellation, refund, module, core]
created: 2026-04-17
links:
  - "[[structure/synthetic-travel-booking/module-booking-engine]]"
  - "[[business-logic/synthetic-travel-booking/cancellation-refund-proration-policy]]"
---

# Module: cancellation-handler

จัดการการยกเลิกการจองทั้งหมด ตั้งแต่คำนวณค่าธรรมเนียมที่ต้องหักตามช่วงเวลาที่ยกเลิก ไปจนถึงสั่งคืนเงินจริงผ่าน payment provider แยกออกมาจาก [[structure/synthetic-travel-booking/module-booking-engine]] เพราะ logic การคำนวณค่าธรรมเนียมซับซ้อนขึ้นเรื่อยๆ ตามเงื่อนไข rate code ของแต่ละซัพพลายเออร์

## ฟังก์ชันหลัก
- `cancelBooking(bookingId: string, reason: string): Promise<CancellationResult>` — เริ่มกระบวนการยกเลิก คำนวณค่าธรรมเนียมและสถานะคืนเงิน
- `computeRefundAmount(bookingId: string, cancelledAt: Date): Promise<RefundBreakdown>` — คำนวณจำนวนเงินคืนตาม proration ของช่วงเวลาที่เหลือ
- `processRefund(bookingId: string, breakdown: RefundBreakdown): Promise<void>` — สั่งคืนเงินจริงผ่าน payment provider ตามยอดที่คำนวณได้

## State

requested → fee_calculated → refund_processing → refunded | refund_stuck — ดู [[business-logic/synthetic-travel-booking/cancellation-refund-proration-policy]]

## ความสัมพันธ์กับ module อื่น

`cancelBooking` แก้สถานะ booking ใน [[structure/synthetic-travel-booking/module-booking-engine]] ได้เฉพาะ transition ไปทาง `cancelled` เท่านั้น ไม่แตะ field อื่น — ถ้าคืนเงินไม่สำเร็จภายในเวลาที่กำหนด สถานะจะค้างเป็น `refund_stuck` และต้องมีคนตรวจก่อนเสมอ เพื่อป้องกันการคืนเงินซ้ำสอง
