---
layer: structure
tags: [event-ticketing, ticketnode, architecture, overview]
created: 2026-07-21
links:
  - "[[structure/synthetic-event-ticketing/module-seat-inventory]]"
  - "[[structure/synthetic-event-ticketing/module-reservation-engine]]"
  - "[[structure/synthetic-event-ticketing/module-waitlist-manager]]"
  - "[[structure/synthetic-event-ticketing/module-transfer-processor]]"
  - "[[structure/synthetic-event-ticketing/module-resale-marketplace]]"
  - "[[structure/synthetic-event-ticketing/module-entry-scanner]]"
---

# ภาพรวมสถาปัตยกรรม TicketNode — ระบบจำหน่ายบัตรงานอีเวนต์

TicketNode คือแพลตฟอร์มจำหน่ายบัตรสำหรับคอนเสิร์ต การแข่งขันกีฬา และงานประชุม รองรับการเลือกที่นั่ง การจองสิทธิ์ซื้อบัตรชั่วคราวก่อนชำระเงิน (hold), ระบบ waitlist เมื่อบัตรขายหมด, การโอนบัตรระหว่างผู้ชม, ตลาดขายต่อ (resale) แบบมีเพดานราคา, และการสแกนบัตรเข้างานที่สถานที่จัดจริง

ทีมวิศวกรรมออกแบบระบบให้จัดการ race condition เรื่องที่นั่งเป็นเรื่องสำคัญที่สุด เพราะที่นั่งหนึ่งที่ขายให้สองคนพร้อมกันไม่ใช่แค่ปัญหาทางเทคนิค แต่กลายเป็นปัญหาหน้างานจริงที่แก้ไขยากเมื่อผู้ชมทั้งสองคนมาถึงสถานที่จัดงานพร้อมบัตรที่อ้างที่นั่งเดียวกัน

## Module หลัก

- **seat-inventory** — เจ้าของสถานะที่นั่งทั้งหมดในทุกงาน (available/held/sold) เป็น service เดียวที่แก ดู [[structure/synthetic-event-ticketing/module-seat-inventory]]
- **reservation-engine** — เก็บข้อมูลการจอง (ใครจองที่นั่งไหน จำนวนกี่ใบ) แยกออกมาจาก seat-inventory เพราะข ดู [[structure/synthetic-event-ticketing/module-reservation-engine]]
- **waitlist-manager** — จัดการคิวรอเมื่อบัตรงานหนึ่งขายหมด เรียงลำดับตามเวลาลงทะเบียนเข้าคิว และเสนอที่น ดู [[structure/synthetic-event-ticketing/module-waitlist-manager]]
- **transfer-processor** — ประมวลผลการโอนบัตรระหว่างผู้ชม (เช่น เพื่อนซื้อบัตรแล้วโอนให้อีกคนที่ไปงานจริง) ดู [[structure/synthetic-event-ticketing/module-transfer-processor]]
- **resale-marketplace** — ตลาดขายต่อบัตรอย่างเป็นทางการที่จำกัดราคาขายต่อไม่ให้สูงเกินเพดานที่กำหนด เพื่อป ดู [[structure/synthetic-event-ticketing/module-resale-marketplace]]
- **entry-scanner** — ตรวจสอบและบันทึกการสแกนบัตรเข้างานที่สถานที่จัดจริง ต้องทำงานได้แม้ network หน้า ดู [[structure/synthetic-event-ticketing/module-entry-scanner]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-event-ticketing/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-event-ticketing/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-event-ticketing/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-event-ticketing/database-schema]]
