---
layer: structure
tags: [social-feed, pulsefeed, architecture, overview]
created: 2026-03-07
links:
  - "[[structure/synthetic-social-feed/module-feed-ranker]]"
  - "[[structure/synthetic-social-feed/module-content-moderation-service]]"
  - "[[structure/synthetic-social-feed/module-engagement-tracker]]"
  - "[[structure/synthetic-social-feed/module-notification-fanout]]"
  - "[[structure/synthetic-social-feed/module-trending-topic-detector]]"
  - "[[structure/synthetic-social-feed/module-follow-graph-service]]"
---

# ภาพรวมสถาปัตยกรรม PulseFeed — ระบบจัดอันดับ Feed โซเชียล

PulseFeed คือแพลตฟอร์มจัดอันดับเนื้อหาที่ผู้ใช้แต่ละคนจะเห็นบน feed หลัก โดยรวมสัญญาณจาก engagement (like, comment, share), ความสัมพันธ์กับผู้โพสต์ (follow graph), และคุณภาพเนื้อหา (moderation signal) เข้าด้วยกันเป็นคะแนนเดียวต่อโพสต์ต่อผู้ใช้ — ระบบไม่แสดง feed แบบเรียงตามเวลาโพสต์ตรงๆ อีกต่อไปตั้งแต่ปี 2024

ทีมวิศวกรรมแบ่ง service ตามหน้าที่ชัดเจน ตั้งแต่ตัวคำนวณคะแนนจัดอันดับ ไปจนถึงระบบตรวจสอบเนื้อหาที่ผิดกฎ และระบบกระจายการแจ้งเตือนเมื่อมีโพสต์ใหม่ ช่วงที่ระบบรับภาระหนักที่สุดคือตอนมีเหตุการณ์ไวรัล (viral event) ที่คนโพสต์/แชร์เรื่องเดียวกันพร้อมกันเป็นแสนคนในเวลาไม่กี่นาที

## Module หลัก

- **feed-ranker** — คำนวณคะแนนจัดอันดับโพสต์ต่อผู้ใช้แต่ละคน รวมสัญญาณจาก engagement, ความสัมพันธ์ follow, และ moderation status เข้าด้วยกัน แยกออกมาเป็น service อิสระตั้งแต่ปี 2024 เพราะโมเดลจัดอันดับซับซ้อนขึ้นเรื่อยๆ ดู [[structure/synthetic-social-feed/module-feed-ranker]]
- **content-moderation-service** — ตรวจสอบโพสต์ใหม่ทุกตัวหาเนื้อหาที่ผิดกฎ (hate speech, spam, ภาพผิดกฎหมาย) ใช้ทั้ ดู [[structure/synthetic-social-feed/module-content-moderation-service]]
- **engagement-tracker** — บันทึก event การ like/comment/share ทุกตัวแบบ append-only เป็นแหล่งข้อมูลดิบสำหร ดู [[structure/synthetic-social-feed/module-engagement-tracker]]
- **notification-fanout** — กระจายการแจ้งเตือนให้ follower ทุกคนเมื่อผู้ที่ตามอยู่โพสต์ใหม่ ต้องรับมือกับ fa ดู [[structure/synthetic-social-feed/module-notification-fanout]]
- **trending-topic-detector** — ตรวจจับ hashtag/หัวข้อที่กำลังถูกพูดถึงเยอะผิดปกติในช่วงเวลาสั้นๆ ดู [[structure/synthetic-social-feed/module-trending-topic-detector]]
- **follow-graph-service** — เก็บความสัมพันธ์ follow/follower ทั้งหมดของแพลตฟอร์ม เป็น service เดียวที่รู้ว่า ดู [[structure/synthetic-social-feed/module-follow-graph-service]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-social-feed/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-social-feed/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-social-feed/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-social-feed/database-schema]]
