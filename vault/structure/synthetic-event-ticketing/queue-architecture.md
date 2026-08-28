---
layer: structure
tags: [event-ticketing, ticketnode, queue, async]
created: 2025-09-08
links:
  - "[[structure/synthetic-event-ticketing/module-waitlist-manager]]"
  - "[[structure/synthetic-event-ticketing/module-entry-scanner]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `seat.held`, `seat.sold`, `seat.released`, `waitlist.slot_available`, `ticket.transferred`, `entry.scanned` — [[structure/synthetic-event-ticketing/module-waitlist-manager]] subscribe `seat.released` เพื่อเสนอที่นั่งที่ว่างลงให้คนในคิว waitlist ทันที

[[structure/synthetic-event-ticketing/module-entry-scanner]] publish `entry.scanned` ทุกครั้งที่สแกน ไม่ว่าจะสำเร็จหรือถูกปฏิเสธ เพื่อให้ทีมรักษาความปลอดภัยหน้างานเห็น log การสแกนแบบ real-time
