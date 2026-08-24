---
layer: business-logic
tags: [loyalty, priority, policy]
created: 2025-10-15
---

# นโยบายสิทธิพิเศษตาม Loyalty Tier

ลูกค้า tier `gold` ขึ้นไปได้สิทธิ์ hold inventory นานกว่าปกติ (`BOOKING_HOLD_TTL_SEC` x 2) และได้ priority ในการจัดสรรที่พักทดแทนกรณี overbooking ก่อนลูกค้า tier ทั่วไปเสมอ

สิทธิพิเศษนี้คำนวณจาก tier ที่บันทึกในระบบ ณ เวลาที่เริ่ม hold ไม่ใช่ tier ปัจจุบัน เพื่อไม่ให้ tier เปลี่ยนกลางทางระหว่างขั้นตอนจองส่งผลย้อนหลัง
