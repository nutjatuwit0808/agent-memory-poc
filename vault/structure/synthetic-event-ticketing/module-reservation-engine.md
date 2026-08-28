---
layer: structure
tags: [reservation, module]
created: 2026-04-30
links:
  - "[[business-logic/synthetic-event-ticketing/max-tickets-per-buyer-policy]]"
---

# Module: reservation-engine

เก็บข้อมูลการจอง (ใครจองที่นั่งไหน จำนวนกี่ใบ) แยกออกมาจาก seat-inventory เพราะข้อมูลการจองมีรายละเอียดทางธุรกิจเยอะกว่าแค่สถานะที่นั่งดิบ เช่น ราคาที่ตกลง โปรโมชันที่ใช้ และช่องทางการซื้อ

## ฟังก์ชันหลัก
- `createReservation(buyerId: string, seatIds: string[], eventId: string): Promise<string>` — สร้างการจอง เรียก holdSeat ของทุกที่นั่งที่เลือก คืน reservationId
- `cancelReservation(reservationId: string): Promise<void>` — ยกเลิกการจอง ปล่อยที่นั่งที่เกี่ยวข้องทั้งหมดกลับคืน
- `getBuyerTicketCount(buyerId: string, eventId: string): Promise<number>` — นับจำนวนบัตรที่ผู้ซื้อรายหนึ่งถืออยู่แล้วสำหรับงานนั้น

## ความสัมพันธ์กับ module อื่น

ก่อนสร้างการจองใหม่ต้องเรียก `getBuyerTicketCount` ตรวจสอบก่อนเสมอ ไม่ให้เกินเพดานที่กำหนดใน [[business-logic/synthetic-event-ticketing/max-tickets-per-buyer-policy]]
