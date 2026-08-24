---
layer: structure
tags: [social-feed, pulsefeed, gateway, api]
created: 2025-10-23
links:
  - "[[structure/synthetic-social-feed/module-feed-ranker]]"
  - "[[structure/synthetic-social-feed/module-engagement-tracker]]"
---

# API Gateway

คำขอโหลด feed จาก mobile app เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งเรียก [[structure/synthetic-social-feed/module-feed-ranker]] เพื่อขอลิสต์โพสต์ที่จัดอันดับแล้ว คำขอที่ต้องการผลทันที เช่น เปิดแอปครั้งแรก ใช้ synchronous call ตรงนี้

การ like/comment/share ส่งผ่าน gateway เดียวกันแต่ตอบกลับแบบ optimistic (บันทึกใน client ก่อน แล้ว sync เข้า [[structure/synthetic-social-feed/module-engagement-tracker]] แบบ async) เพื่อให้ interaction รู้สึกทันทีไม่มีดีเลย์
