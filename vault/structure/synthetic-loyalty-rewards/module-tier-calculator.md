---
layer: structure
tags: [tier, module, core]
created: 2026-04-19
links:
  - "[[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy]]"
  - "[[structure/synthetic-loyalty-rewards/module-points-ledger]]"
---

# Module: tier-calculator

คำนวณและบริหาร tier ของสมาชิก (Bronze/Silver/Gold/Platinum) โดยอิงจากยอดแต้มสะสมรอบปีปัจจุบัน แยกออกจาก points-ledger ตั้งแต่ต้นเพราะ logic การ upgrade/downgrade มีเงื่อนไขซับซ้อนโดยเฉพาะช่วง grace period ที่ไม่ควรปะปนกับ ledger transaction

## ฟังก์ชันหลัก
- `getCurrentTier(accountId: string): Promise<TierStatus>` — คืน tier ปัจจุบันและยอดแต้มสะสมในรอบปีที่ใช้คำนวณ
- `evaluateTierChange(accountId: string): Promise<TierChangeResult>` — ตรวจว่าสมาชิกควร upgrade หรือ downgrade จาก tier ปัจจุบัน
- `applyGracePeriod(accountId: string, reason: GraceReason): Promise<void>` — ตั้ง grace period เมื่อสมาชิกอยู่ใน downgrade zone ดู [[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy]]
- `getAnnualPointsSummary(accountId: string, year: number): Promise<AnnualSummary>` — คืนยอดแต้มสะสมและสถิติ tier ของรอบปีที่ระบุ

## State

bronze → silver → gold → platinum (upgrade เมื่อถึง threshold) และ platinum → gold → silver → bronze (downgrade หลัง grace period หมด) — ดู [[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy]] สำหรับเงื่อนไขเวลา

## ความสัมพันธ์กับ module อื่น

subscribe `points.credited` จาก [[structure/synthetic-loyalty-rewards/module-points-ledger]] เพื่อ re-evaluate tier ทันทีที่แต้มเข้าถึง threshold ไม่รอ batch รายสัปดาห์เพราะ tier upgrade มักมาพร้อม benefit ที่สมาชิกต้องการใช้ทันที
