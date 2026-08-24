---
layer: structure
tags: [travel-booking, tripledger, gateway, api]
created: 2026-03-24
links:
  - "[[structure/synthetic-travel-booking/module-availability-search]]"
  - "[[structure/synthetic-travel-booking/queue-architecture]]"
---

# API Gateway

คำขอค้นหา (search) เข้าทาง gateway แล้วกระจายไปยัง [[structure/synthetic-travel-booking/module-availability-search]] แบบ synchronous เพราะผู้ใช้รอผลลัพธ์อยู่หน้าจอ — gateway ตั้ง timeout รวมไว้ที่ 3 วินาที ถ้าซัพพลายเออร์รายไหนตอบช้ากว่านั้นจะถูกตัดออกจากผลลัพธ์รอบนั้นแล้วให้ผลจากรายที่เหลือแทน ไม่ปล่อยให้ทั้งหน้าค้าง

คำขอยืนยันการจอง (`POST /bookings`) เป็น synchronous เช่นกันเพราะต้องคืนเลขที่จองให้ผู้ใช้ทันที แต่ขั้นตอนที่ตามมาหลังยืนยัน (ส่งอีเมล, sync กลับไปหาซัพพลายเออร์, อัปเดต loyalty point) ทำแบบ asynchronous ผ่าน event ทั้งหมด ดู [[structure/synthetic-travel-booking/queue-architecture]]
