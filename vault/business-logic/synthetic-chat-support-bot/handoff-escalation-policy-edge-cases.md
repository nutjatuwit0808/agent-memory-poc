---
layer: business-logic
tags: [handoff, edge-case]
created: 2025-09-22
links:
  - "[[business-logic/synthetic-chat-support-bot/handoff-escalation-policy]]"
---

# ข้อยกเว้นเมื่อคิว Handoff ล้นเกินกำลังเจ้าหน้าที่

เมื่อความลึกของคิวเกิน `HANDOFF_MAX_QUEUE_DEPTH` ระบบจะไม่รับ handoff ประเภท `general` เข้าคิวเพิ่มชั่วคราว — bot จะบอกลูกค้าว่าคิวเต็มพร้อมเวลาที่คาดว่าจะรอ แต่ยังรับ `escalation` และ `high_risk` เข้าคิวได้เสมอไม่ว่าคิวจะลึกแค่ไหน เพราะสองกลุ่มนี้มีความเสี่ยงสูงกว่าถ้าปล่อยลูกค้าไว้กับ bot ต่อ

บทสนทนาที่ถูกปฏิเสธเข้าคิวเพราะคิวเต็มจะถูกจัดคิวใหม่อัตโนมัติทุก 5 นาทีจนกว่าคิวจะมีที่ว่าง ไม่ต้องให้ลูกค้าพิมพ์ขอใหม่เอง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-chat-support-bot/handoff-escalation-policy]] ("นโยบายการยกระดับ Handoff") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
