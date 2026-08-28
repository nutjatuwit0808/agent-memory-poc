---
layer: structure
tags: [redemption, module, core]
created: 2026-01-31
links:
  - "[[structure/synthetic-loyalty-rewards/module-points-ledger]]"
  - "[[structure/synthetic-loyalty-rewards/module-tier-calculator]]"
  - "[[business-logic/synthetic-loyalty-rewards/redemption-threshold-policy]]"
---

# Module: redemption-engine

รับผิดชอบกระบวนการแลกรางวัลทั้งหมด ตั้งแต่ตรวจสอบว่าสมาชิกมีแต้มพอและมีสิทธิ์แลก ไปจนถึงตัด debit และสร้าง order รางวัล แยกออกมาเป็น service อิสระเพราะการแลกรางวัลต้องการ atomicity ของหลาย operation พร้อมกัน (check balance + debit + create order) ซึ่งต้องจัดการ race condition ต่างจาก operation ทั่วไป

## ฟังก์ชันหลัก
- `initiateRedemption(accountId: string, rewardId: string): Promise<RedemptionOrder>` — เริ่มกระบวนการแลกรางวัล ตรวจสิทธิ์และล็อก balance ก่อน
- `confirmRedemption(orderId: string): Promise<void>` — ยืนยัน redemption ทำ debit จริง และส่ง fulfillment request
- `cancelRedemption(orderId: string, reason: string): Promise<void>` — ยกเลิก redemption และคืน locked points กลับเข้าบัญชี
- `getRedemptionStatus(orderId: string): Promise<RedemptionOrder>` — ดึงสถานะปัจจุบันของ redemption order

## State

pending → points_locked → confirmed | cancelled — points ถูก lock ระหว่าง pending นานสูงสุด 15 นาที ถ้าไม่ confirm จะ auto-cancel คืนแต้มให้ เพื่อป้องกันแต้มติดค้างแบบ indefinite

## ความสัมพันธ์กับ module อื่น

ต้องเรียกทั้ง [[structure/synthetic-loyalty-rewards/module-points-ledger]] (debit) และ [[structure/synthetic-loyalty-rewards/module-tier-calculator]] (ตรวจ tier benefit) ในกระบวนการ confirm ดู [[business-logic/synthetic-loyalty-rewards/redemption-threshold-policy]] สำหรับเกณฑ์แต้มขั้นต่ำและสิทธิ์พิเศษตาม tier
