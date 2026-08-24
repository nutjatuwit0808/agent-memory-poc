---
layer: business-logic
tags: [moderation, policy]
created: 2025-11-03
links:
  - "[[structure/synthetic-social-feed/module-content-moderation-service]]"
  - "[[business-logic/synthetic-social-feed/content-moderation-escalation-policy-edge-cases]]"
---

# นโยบายการยกระดับการตรวจสอบเนื้อหา

โพสต์ที่ [[structure/synthetic-social-feed/module-content-moderation-service]] ตรวจแล้วได้ confidence สูงกว่า `MODERATION_AUTO_REMOVE_THRESHOLD` ว่าผิดกฎ จะถูกถอดออกอัตโนมัติทันทีโดยไม่ต้องรอคนตรวจ

โพสต์ที่ confidence อยู่ระหว่าง 0.5-0.95 จะถูกส่งเข้าคิว human review — ระหว่างรอตรวจยังคงแสดงบน feed ปกติ (optimistic publish) เว้นแต่มีการ report จากผู้ใช้จำนวนมากพร้อมกัน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-social-feed/content-moderation-escalation-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
