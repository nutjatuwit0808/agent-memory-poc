---
layer: structure
tags: [food-delivery, quickbite, queue, async]
created: 2026-07-18
links:
  - "[[structure/synthetic-food-delivery/module-order-router]]"
  - "[[structure/synthetic-food-delivery/module-driver-payout-engine]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `order.created`, `order.accepted_by_restaurant`, `driver.assigned`, `driver.picked_up`, `order.delivered`, `driver.went_offline` — [[structure/synthetic-food-delivery/module-order-router]] เป็นทั้งผู้ publish และ subscribe เพราะต้อง react ต่อการเปลี่ยนแปลงสถานะของออร์เดอร์ที่ตัวเองสร้าง

[[structure/synthetic-food-delivery/module-driver-payout-engine]] subscribe `order.delivered` เพื่อคำนวณรายได้คนขับอัตโนมัติ โดยไม่ต้องรอให้ [[structure/synthetic-food-delivery/module-order-router]] สั่งตรงๆ ออกแบบแบบนี้เพื่อให้ระบบ payout ไม่ผูกกับ order flow หลัก ถ้า order-router ล่ม หน้าที่ payout ยังทำงานต่อจาก event ที่ queue รับไว้
