---
layer: business-logic
tags: [engagement, policy]
created: 2026-04-24
links:
  - "[[business-logic/synthetic-social-feed/engagement-dedup-policy-edge-cases]]"
---

# นโยบายการกันนับ Engagement ซ้ำ

การ like/comment/share ที่มาจาก user คนเดียวกันบนโพสต์เดียวกันภายใน `ENGAGEMENT_DEDUP_WINDOW_MS` มิลลิวินาที จะถูกนับเป็น event เดียวเท่านั้น ป้องกันการนับซ้ำจากการแตะปุ่มถี่ๆ หรือ retry ของ client

dedup key ประกอบจาก (userId, postId, actionType, timeWindow) — ไม่ใช่แค่ (userId, postId) เพราะ user คนเดียวกัน like แล้ว unlike แล้ว like ใหม่ในโพสต์เดียวกันถือเป็น event คนละตัวได้ถ้าห่างกันเกิน window

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-social-feed/engagement-dedup-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
