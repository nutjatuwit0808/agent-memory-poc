---
layer: structure
tags: [waitlist, module, core]
created: 2025-09-28
links:
  - "[[structure/synthetic-event-ticketing/module-seat-inventory]]"
---

# Module: waitlist-manager

จัดการคิวรอเมื่อบัตรงานหนึ่งขายหมด เรียงลำดับตามเวลาลงทะเบียนเข้าคิว และเสนอที่นั่งที่ว่างลงให้คนในคิวตามลำดับเมื่อมีที่นั่งว่างจากการยกเลิกหรือ hold หมดอายุ

## ฟังก์ชันหลัก
- `joinWaitlist(buyerId: string, eventId: string): Promise<string>` — ลงทะเบียนเข้าคิว waitlist คืน waitlistEntryId
- `releaseNextBatch(eventId: string, seatCount: number): Promise<string[]>` — ปล่อยสิทธิ์ซื้อให้คนในคิวตามลำดับเมื่อมีที่นั่งว่าง คืนรายชื่อ buyerId ที่ได้รับสิทธิ์
- `getWaitlistPosition(buyerId: string, eventId: string): Promise<number>` — คืนลำดับปัจจุบันของผู้ซื้อในคิว

## State

waiting → offered → claimed | expired — offered ที่ไม่ถูก claim ภายในเวลาที่กำหนดจะถูกเสนอให้คนถัดไปในคิวแทน

## ความสัมพันธ์กับ module อื่น

subscribe event `seat.released` จาก [[structure/synthetic-event-ticketing/module-seat-inventory]] เพื่อทริกเกอร์ `releaseNextBatch` อัตโนมัติ ไม่ต้องรอ manual trigger จากทีมงาน
