---
layer: business-logic
tags: [booking, concurrency, edge-case]
created: 2025-12-28
links:
  - "[[business-logic/synthetic-travel-booking/booking-hold-atomicity-policy]]"
---

# กรณี Hold หมดอายุพอดีตอนกำลัง Confirm

ถ้า `confirmBooking` ถูกเรียกในช่วงเสี้ยววินาทีที่ hold กำลังจะหมดอายุพอดี ระบบยึดเวลาที่ request มาถึง service เป็นหลัก ไม่ใช่เวลาที่ query database เสร็จ — ถ้า request มาถึงก่อนหมดอายุแม้จะ process เสร็จหลังหมดอายุไปแล้วเล็กน้อย ก็ยังถือว่า valid

เหตุผลที่ยึดแบบนี้เพราะผู้ใช้กด "ยืนยันการจอง" ไปแล้วจริง การปฏิเสธเพราะ processing ช้าไปไม่กี่ร้อยมิลลิวินาทีจะสร้างประสบการณ์ที่แย่และไม่เป็นธรรมกับผู้ใช้ที่ทำถูกต้องทุกขั้นตอน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-travel-booking/booking-hold-atomicity-policy]] ("นโยบายความเป็น Atomic ของ Booking Hold") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
