---
layer: structure
tags: [expiry, scheduler, module]
created: 2026-07-30
links:
  - "[[business-logic/synthetic-loyalty-rewards/points-expiry-policy]]"
  - "[[structure/synthetic-loyalty-rewards/module-tier-calculator]]"
---

# Module: expiry-scheduler

ติดตามและ execute การหมดอายุของแต้มตาม policy ที่กำหนด รันเป็น batch job ช่วง 00:00-02:00 ทุกวัน เหตุผลที่แยกเป็น service ต่างหากคือ expiry logic มีความซับซ้อนของตัวเอง เช่น partial expiry และ tier-based extension ที่ไม่ควรปะปนกับ transaction flow ปกติของ points-ledger

## ฟังก์ชันหลัก
- `scheduleExpiry(accountId: string, amount: number, expiresAt: string): Promise<void>` — ตั้งกำหนดการหมดอายุสำหรับแต้ม batch นี้
- `processExpiredPoints(batchDate: string): Promise<ExpiryReport>` — รัน expiry สำหรับวันที่ระบุ คืน report ว่าแต้มกี่ point จากกี่บัญชีถูก expire
- `previewExpiry(accountId: string, daysAhead: number): Promise<ExpiryForecast>` — แสดงตัวอย่างว่าแต้มของสมาชิกจะหมดอายุเมื่อไหร่บ้างในช่วง n วันข้างหน้า

## ความสัมพันธ์กับ module อื่น

ดู [[business-logic/synthetic-loyalty-rewards/points-expiry-policy]] สำหรับ window หมดอายุและเงื่อนไข extension ตาม tier — expiry-scheduler ต้อง query tier ปัจจุบันจาก [[structure/synthetic-loyalty-rewards/module-tier-calculator]] ก่อนทุกครั้งที่รัน batch เพราะ Gold และ Platinum มี expiry window ที่ยาวกว่า Bronze และ Silver
