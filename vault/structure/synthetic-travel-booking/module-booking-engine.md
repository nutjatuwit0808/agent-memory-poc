---
layer: structure
tags: [booking, module, core]
created: 2025-10-31
links:
  - "[[business-logic/synthetic-travel-booking/booking-hold-atomicity-policy]]"
  - "[[structure/synthetic-travel-booking/module-itinerary-builder]]"
---

# Module: booking-engine

หัวใจของระบบ — รับผิดชอบการจองจริงตั้งแต่ hold inventory ชั่วคราวจนถึงยืนยันการจอง เป็น service เดียวที่มีสิทธิ์เขียนสถานะ `bookings` และ `booking_holds` ทุกอย่างที่แตะเงินหรือสิทธิ์ในห้องต้องผ่านตัวนี้เท่านั้น

## ฟังก์ชันหลัก
- `holdInventory(offerId: string, ttlSec: number): Promise<HoldToken>` — จองห้องชั่วคราวระหว่างผู้ใช้กรอกข้อมูลชำระเงิน
- `confirmBooking(holdToken: string, paymentRef: string): Promise<BookingResult>` — ยืนยันการจองจริงจาก hold ที่ยังไม่หมดอายุ
- `releaseHold(holdToken: string, reason: string): Promise<void>` — ปล่อย hold คืนก่อนหมดอายุ เช่น ผู้ใช้ยกเลิกเองระหว่างกรอกฟอร์ม

## State

held → confirmed | expired | released — ดู [[business-logic/synthetic-travel-booking/booking-hold-atomicity-policy]] สำหรับเงื่อนไขว่าเมื่อไหร่สอง hold ชนกันได้

## ความสัมพันธ์กับ module อื่น

`confirmBooking` เช็คว่า hold ยังไม่หมดอายุก่อนเสมอ ถ้าหมดอายุแล้วจะปฏิเสธทันทีแม้การชำระเงินจะสำเร็จฝั่ง payment provider แล้วก็ตาม (กรณีนี้ต้อง refund เงินคืนแยกต่างหาก ไม่ใช่หน้าที่ของ booking-engine) — [[structure/synthetic-travel-booking/module-itinerary-builder]] ฟัง event `booking.confirmed` เพื่อประกอบทริปต่อ
