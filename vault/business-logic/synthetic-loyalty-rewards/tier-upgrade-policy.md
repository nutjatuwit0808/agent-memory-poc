---
layer: business-logic
tags: [tier, upgrade, policy]
created: 2026-06-04
links:
  - "[[structure/synthetic-loyalty-rewards/module-tier-calculator]]"
---

# นโยบายการ Upgrade Tier

สมาชิกจะ upgrade tier โดยอัตโนมัติเมื่อยอดแต้มสะสมรอบปีปัจจุบันถึง threshold ของ tier ถัดไป โดยไม่ต้องรอ batch รายสัปดาห์ — [[structure/synthetic-loyalty-rewards/module-tier-calculator]] subscribe `points.credited` และประเมินทันทีเมื่อแต้มเข้า

การ upgrade มีผลทันทีในทุก service ที่ดู tier status ผ่าน [[structure/synthetic-loyalty-rewards/module-tier-calculator]] benefit ใหม่เช่น early access offer และ redemption privileges จะใช้ได้ทันทีโดยไม่ต้องรอ session refresh
