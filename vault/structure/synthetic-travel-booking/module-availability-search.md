---
layer: structure
tags: [search, module, core]
created: 2026-08-05
links:
  - "[[structure/synthetic-travel-booking/module-price-cache]]"
---

# Module: availability-search

รับ query ค้นหาจากผู้ใช้ (ปลายทาง, วันเข้าพัก, จำนวนผู้เข้าพัก) แล้ว fan-out ไปหาซัพพลายเออร์ที่เกี่ยวข้องแบบขนาน รวมผลลัพธ์และจัดอันดับก่อนส่งกลับ เป็น stateless service ล้วนๆ ไม่เก็บ inventory เองแม้แต่น้อย พึ่งพา [[structure/synthetic-travel-booking/module-price-cache]] เพื่อลด latency แทนการยิงหาซัพพลายเออร์ทุกครั้ง

## ฟังก์ชันหลัก
- `searchAvailability(criteria: SearchCriteria): Promise<AvailabilityResult[]>` — จุดเข้าเดียวของการค้นหา กระจาย query ไปหลายซัพพลายเออร์พร้อมกัน
- `rankResults(results: AvailabilityResult[], prefs: RankingPrefs): AvailabilityResult[]` — จัดอันดับผลลัพธ์ตามราคา/ระยะทาง/rating ผสมกัน
- `excludeDegradedSuppliers(supplierIds: string[]): void` — ตัดซัพพลายเออร์ที่ถูก mark degraded ออกจากรอบค้นหาถัดไปชั่วคราว

## ความสัมพันธ์กับ module อื่น

ไม่เรียกซัพพลายเออร์ตรงถ้ามีราคาที่ยัง valid อยู่ใน [[structure/synthetic-travel-booking/module-price-cache]] — เรียกตรงเฉพาะตอน cache miss เท่านั้น เพื่อไม่ให้ปริมาณ query ไปกระทบ rate limit ของซัพพลายเออร์แต่ละราย ผลการค้นหาที่ส่งกลับไม่ใช่การจองห้อง แค่แสดงว่ามีโอกาสจองได้ ณ เวลานั้น
