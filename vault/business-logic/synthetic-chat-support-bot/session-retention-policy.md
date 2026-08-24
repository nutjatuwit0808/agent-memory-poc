---
layer: business-logic
tags: [session, retention, policy]
created: 2026-05-01
links:
  - "[[structure/synthetic-chat-support-bot/module-session-store]]"
---

# นโยบายการเก็บรักษา Session

[[structure/synthetic-chat-support-bot/module-session-store]] เก็บ session ที่ปิดแล้วไว้ในสถานะ read-only 24 ชั่วโมงก่อนลบทิ้งจริง เพื่อให้ทีม debug สามารถตรวจสอบปัญหาการเชื่อมต่อย้อนหลังได้ในกรอบเวลาสั้นๆ

session ที่เกี่ยวข้องกับบทสนทนาที่ถูก flag ว่าเป็น `high_risk` จะถูกเก็บนานกว่าปกติตามระยะเวลาที่นโยบาย compliance ขององค์กรลูกค้ากำหนด
