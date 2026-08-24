---
layer: business-logic
tags: [transcode, priority, edge-case]
created: 2026-07-17
links:
  - "[[business-logic/synthetic-video-streaming/live-event-scaling-policy]]"
  - "[[business-logic/synthetic-video-streaming/transcode-priority-policy]]"
---

# ข้อยกเว้นเมื่อ Live Event หลายรายการชนกันพร้อมกัน

เมื่อมี live event มากกว่าจำนวน worker ที่ scale ทันในเวลานั้น ระบบจะไม่แบ่ง worker เท่ากันทุก event — event ที่มีผู้ชมลงทะเบียนรอมากกว่าจะได้ worker ก่อน เพราะผลกระทบต่อผู้ชมรวมสูงกว่า แม้ event ที่ผู้ชมน้อยกว่าจะเข้าคิวก่อนก็ตาม

event ที่ถูกลดจำนวน worker ลงจะ fallback ไปใช้ bitrate ladder ที่มีจำนวน rung น้อยลงชั่วคราวแทนการหยุดสตรีมไปเลย เพื่อให้ผู้ชมยังดูได้แม้คุณภาพจะลดลง ดูรายละเอียดที่ [[business-logic/synthetic-video-streaming/live-event-scaling-policy]]

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-video-streaming/transcode-priority-policy]] ("นโยบายลำดับความสำคัญของคิว Transcode") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
