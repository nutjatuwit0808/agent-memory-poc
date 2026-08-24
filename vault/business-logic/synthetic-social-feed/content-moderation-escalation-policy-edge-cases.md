---
layer: business-logic
tags: [moderation, edge-case]
created: 2026-07-08
links:
  - "[[business-logic/synthetic-social-feed/content-moderation-escalation-policy]]"
---

# ข้อยกเว้นเมื่อคิว Human Review ล้น

ถ้าคิว human review ลึกเกิน `MODERATION_REVIEW_QUEUE_MAX_DEPTH` ระบบจะลด threshold auto-remove ลงชั่วคราว (จาก 0.95 เป็น 0.85) เพื่อลดจำนวนโพสต์ที่ค้างรอคนตรวจ ยอมรับ false positive เพิ่มขึ้นเล็กน้อยเพื่อแลกกับการกำจัดเนื้อหาผิดกฎเร็วขึ้นตอนคิวล้น

โพสต์ที่เกี่ยวข้องกับความปลอดภัยของบุคคล (เช่น การขู่ทำร้าย) ไม่เข้าเงื่อนไขลด threshold นี้ ยังคงต้องผ่านเกณฑ์ปกติเสมอเพราะความเสี่ยงสูงเกินกว่าจะยอมรับ false positive เพิ่ม

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-social-feed/content-moderation-escalation-policy]] ("นโยบายการยกระดับการตรวจสอบเนื้อหา") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
