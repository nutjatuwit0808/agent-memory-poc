---
layer: structure
tags: [loyalty-rewards, pointsvault, queue, async]
created: 2025-11-10
links:
  - "[[structure/synthetic-loyalty-rewards/module-tier-calculator]]"
  - "[[structure/synthetic-loyalty-rewards/module-expiry-scheduler]]"
  - "[[structure/synthetic-loyalty-rewards/module-points-ledger]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `points.credited`, `points.redeemed`, `points.expired`, `tier.upgraded`, `tier.downgraded`, `offer.generated` — [[structure/synthetic-loyalty-rewards/module-tier-calculator]] subscribe `points.credited` เพื่อตรวจว่าถึง tier threshold หรือยัง ไม่ต้องรอ batch รายสัปดาห์

[[structure/synthetic-loyalty-rewards/module-expiry-scheduler]] publish `points.expired` เมื่อถึงเวลาลบแต้มหมดอายุ ซึ่ง [[structure/synthetic-loyalty-rewards/module-points-ledger]] subscribe เพื่อทำ debit อัตโนมัติ ออกแบบให้แยกกันเพื่อไม่ให้ expiry logic และ ledger logic ปะปนกัน ถ้า points-ledger ล่มช่วง expiry job event จะยังคงอยู่ใน queue รอให้ consume ภายหลัง
