---
layer: structure
tags: [social-feed, pulsefeed, boundaries]
created: 2026-02-07
links:
  - "[[structure/synthetic-social-feed/module-feed-ranker]]"
  - "[[structure/synthetic-social-feed/module-engagement-tracker]]"
  - "[[structure/synthetic-social-feed/module-content-moderation-service]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-social-feed/module-feed-ranker]] เก็บแค่คะแนนที่คำนวณล่าสุดต่อคู่ (user, post) ส่วน [[structure/synthetic-social-feed/module-engagement-tracker]] เป็นเจ้าของ event ดิบทั้งหมด (like/comment/share) ไม่รู้จักคะแนนจัดอันดับเลย

[[structure/synthetic-social-feed/module-content-moderation-service]] ทำงานแบบ async กับทุก service อื่น — โพสต์ใหม่ขึ้น feed ได้ทันทีก่อน moderation ตรวจเสร็จด้วยซ้ำ (optimistic publish) แล้วค่อยถอดออกทีหลังถ้าผิดกฎ เพราะการรอ moderation ก่อน publish ทุกโพสต์จะทำให้ latency ของการโพสต์แย่เกินยอมรับได้
