---
layer: business-logic
tags: [notification, edge-case]
created: 2025-11-25
links:
  - "[[business-logic/synthetic-social-feed/notification-fanout-rate-limit-policy]]"
---

# ข้อยกเว้นเมื่อเป็นเหตุการณ์ไวรัลข้ามผู้ใช้หลายคนพร้อมกัน

ถ้าตรวจพบว่ามีหลาย celebrity account โพสต์เรื่องเดียวกันพร้อมกัน (viral event) ระบบจะรวม fanout job ที่ทับซ้อนกันของ follower คนเดียวกันเป็น notification เดียว ไม่ส่งซ้ำหลายครั้งในเวลาไล่เลี่ยกัน เพื่อลดความรำคาญของผู้ใช้

ในช่วง viral event ระบบยอมให้ delay การส่งแจ้งเตือนนานขึ้นกว่าปกติ (จากไม่กี่วินาทีเป็นหลักนาที) เพื่อรักษาความเสถียรของระบบ fanout โดยรวม แทนที่จะพยายามส่งทันทีจนระบบล่ม

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-social-feed/notification-fanout-rate-limit-policy]] ("นโยบาย Rate Limit การกระจายแจ้งเตือน") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
