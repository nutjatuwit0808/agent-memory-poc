---
layer: structure
tags: [inventory, module, core]
created: 2026-02-02
links:
  - "[[business-logic/synthetic-event-ticketing/hold-expiry-timeout-policy]]"
  - "[[structure/synthetic-event-ticketing/module-waitlist-manager]]"
---

# Module: seat-inventory

เจ้าของสถานะที่นั่งทั้งหมดในทุกงาน (available/held/sold) เป็น service เดียวที่แก้ไขสถานะที่นั่งได้โดยตรง ทุก service อื่นที่ต้องการเปลี่ยนสถานะที่นั่งต้องเรียกผ่าน service นี้เท่านั้น เพื่อป้องกันการจองซ้อนที่นั่งเดียวกัน

## ฟังก์ชันหลัก
- `holdSeat(seatId: string, buyerId: string, ttlSeconds: number): Promise<string>` — จองที่นั่งชั่วคราว คืน holdId ถ้าสำเร็จ ปฏิเสธถ้าที่นั่งไม่ว่าง
- `confirmSale(holdId: string): Promise<void>` — ยืนยันการขายจาก hold ที่ชำระเงินสำเร็จแล้ว เปลี่ยนสถานะเป็น sold
- `releaseSeat(seatId: string): Promise<void>` — ปล่อยที่นั่งกลับเป็น available เมื่อ hold หมดอายุหรือถูกยกเลิก

## State

available → held → sold | released_back_to_available — ดู [[business-logic/synthetic-event-ticketing/hold-expiry-timeout-policy]]

## ความสัมพันธ์กับ module อื่น

ทุกครั้งที่ `releaseSeat` สำเร็จ publish event `seat.released` ให้ [[structure/synthetic-event-ticketing/module-waitlist-manager]] subscribe เพื่อเสนอที่นั่งให้คนในคิว waitlist ทันที
