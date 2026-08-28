---
layer: structure
tags: [food-delivery, quickbite, database, schema]
created: 2026-06-19
links:
  - "[[structure/synthetic-food-delivery/module-driver-dispatch]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-food-delivery/module-driver-dispatch]] ดูแล ได้แก่ `drivers` (สถานะปัจจุบัน), `driver_location_log` (ประวัติตำแหน่ง ไม่ลบทิ้งเพื่อวิเคราะห์ route), และ `active_assignments`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `orders` | order-router | สถานะออร์เดอร์ทั้ง pending/active/delivered |
| `drivers` | driver-dispatch | ตำแหน่ง, สถานะ, rating ปัจจุบัน |
| `restaurants` | restaurant-relay | เวลาเตรียมอาหาร, รัศมีรับออร์เดอร์, สถานะเปิด/ปิด |
| `payout_records` | driver-payout-engine | บันทึกการคำนวณและจ่ายรายได้ |

ทุกตารางใช้ `order_id` เป็น foreign key ร่วมกันแบบ soft reference ไม่มี FK constraint ข้าม database จริง ตรวจสอบความสอดคล้องด้วย reconciliation job รายชั่วโมง
