---
layer: business-logic
tags: [notification, policy]
created: 2025-09-21
links:
  - "[[business-logic/synthetic-social-feed/notification-fanout-rate-limit-policy-edge-cases]]"
---

# นโยบาย Rate Limit การกระจายแจ้งเตือน

ผู้ใช้ที่มี follower เกิน `CELEBRITY_FOLLOWER_THRESHOLD` คน จะถูกจัดเป็น celebrity tier — การ fanout แจ้งเตือนของโพสต์จากบัญชีกลุ่มนี้จะถูกกระจายเป็น batch ที่ควบคุมอัตราเข้าคิวแยกต่างหาก ไม่ยิงพร้อมกันทั้งหมด

batch ปกติมีขนาด `FANOUT_BATCH_SIZE` คน แต่ละ batch ห่างกันด้วย delay สั้นๆ เพื่อไม่ให้ downstream (push notification provider ภายนอก) โดน rate limit จนบล็อกทั้งระบบ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-social-feed/notification-fanout-rate-limit-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
