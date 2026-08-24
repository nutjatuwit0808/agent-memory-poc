---
layer: structure
tags: [travel-booking, tripledger, architecture, overview]
created: 2026-01-11
links:
  - "[[structure/synthetic-travel-booking/module-availability-search]]"
  - "[[structure/synthetic-travel-booking/module-booking-engine]]"
  - "[[structure/synthetic-travel-booking/module-price-cache]]"
  - "[[structure/synthetic-travel-booking/module-itinerary-builder]]"
  - "[[structure/synthetic-travel-booking/module-cancellation-handler]]"
  - "[[structure/synthetic-travel-booking/module-supplier-sync]]"
---

# ภาพรวมสถาปัตยกรรม TripLedger — ระบบจองที่พักและการเดินทาง

TripLedger คือแพลตฟอร์มค้นหาและจองที่พัก/ตั๋วเดินทาง ที่รวบรวม inventory จากซัพพลายเออร์ภายนอกหลายสิบราย (โรงแรม, OTA พันธมิตร, สายการบินบางเส้นทาง) มาไว้ในจุดค้นหาเดียว ระบบไม่ได้เป็นเจ้าของห้องพักหรือที่นั่งจริง — ทุก inventory เป็นของซัพพลายเออร์ TripLedger ทำหน้าที่เป็นชั้นรวม ค้นหา จอง และจัดการวงจรชีวิตของการจองเท่านั้น

ความท้าทายหลักของระบบคือ inventory ที่แสดงในการค้นหาเป็น "ภาพสะท้อน" ของสิ่งที่ซัพพลายเออร์มีจริง ไม่ใช่แหล่งความจริงเดียวกัน — มีช่วงเวลาที่ตัวเลขไม่ตรงกันเสมอ (staleness) ทีมวิศวกรรมออกแบบระบบทั้งชุดโดยยอมรับความจริงข้อนี้ตั้งแต่ต้น แทนที่จะแสร้งว่า cache กับความจริงตรงกันเป๊ะตลอดเวลา ช่วงที่ปัญหาชัดที่สุดคือ high season (ธันวาคม-มกราคม และเทศกาลสงกรานต์) ที่ inventory หมุนเร็วผิดปกติ

## Module หลัก

- **availability-search** — รับ query ค้นหาจากผู้ใช้ (ปลายทาง, วันเข้าพัก, จำนวนผู้เข้าพัก) แล้ว fan-out ไปหาซัพพลายเออร์ที่เกี่ยวข้องแบบขนาน รวมผลลัพธ์และจัดอันดับก่อนส่งกลับ เป็น stateless service ล้วนๆ ดู [[structure/synthetic-travel-booking/module-availability-search]]
- **booking-engine** — หัวใจของระบบ — รับผิดชอบการจองจริงตั้งแต่ hold inventory ชั่วคราวจนถึงยืนยันการจ ดู [[structure/synthetic-travel-booking/module-booking-engine]]
- **price-cache** — cache ราคาล่าสุดที่ query มาจากซัพพลายเออร์ไว้ใน in-memory store เพื่อให้ {{ref: ดู [[structure/synthetic-travel-booking/module-price-cache]]
- **itinerary-builder** — ประกอบ booking ที่ยืนยันแล้วหลายตัว (เช่น ที่พัก + เที่ยวบิน) ให้เป็นทริปเดียวที ดู [[structure/synthetic-travel-booking/module-itinerary-builder]]
- **cancellation-handler** — จัดการการยกเลิกการจองทั้งหมด ตั้งแต่คำนวณค่าธรรมเนียมที่ต้องหักตามช่วงเวลาที่ยกเลิก ไปจนถึงสั่งคืนเงินจริงผ่าน payment provider แยกออกมาจาก [[structure/synthetic-travel-booking/module-booking-engine]] เพราะ logic การคำนวณค่าธรรมเนียมซับซ้อนขึ้นเรื่อยๆ ดู [[structure/synthetic-travel-booking/module-cancellation-handler]]
- **supplier-sync** — sync จำนวนห้องว่างจริงจากซัพพลายเออร์แต่ละรายเข้ามาเก็บเป็น snapshot ภายใน ทำงาน ดู [[structure/synthetic-travel-booking/module-supplier-sync]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-travel-booking/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-travel-booking/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-travel-booking/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-travel-booking/database-schema]]
