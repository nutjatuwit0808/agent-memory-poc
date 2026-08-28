---
layer: structure
tags: [event-ticketing, ticketnode, database, schema]
created: 2026-01-02
links:
  - "[[structure/synthetic-event-ticketing/module-seat-inventory]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-event-ticketing/module-seat-inventory]] ดูแล ได้แก่ `seats` (สถานะปัจจุบัน), `seat_holds` (การจองชั่วคราว), และ `venue_seat_maps`

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `seats` | seat-inventory | สถานะปัจจุบันเท่านั้น (available/held/sold) |
| `reservations` | reservation-engine | ไม่มี FK ตรงไป seats ใช้ seatId แบบ soft reference |
| `resale_listings` | resale-marketplace | เก็บประวัติการลงขายต่อทั้งหมด |
| `entry_scans` | entry-scanner | append-only เก็บทุกครั้งที่สแกนไม่ว่าสำเร็จหรือไม่ |

ไม่มี FK ข้าม database จริงเพราะแยก schema กันคนละ service — ตรวจความสอดคล้องด้วย reconciliation job รายวัน (เช่น เช็คว่าทุก reservation มี seatId ที่มีอยู่จริง)
