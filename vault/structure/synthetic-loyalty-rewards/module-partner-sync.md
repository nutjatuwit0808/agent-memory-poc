---
layer: structure
tags: [partner, sync, module]
created: 2026-06-21
links:
  - "[[structure/synthetic-loyalty-rewards/module-points-ledger]]"
  - "[[business-logic/synthetic-loyalty-rewards/partner-conversion-policy]]"
---

# Module: partner-sync

รับผิดชอบ sync ข้อมูล transaction และยืนยันแต้มจาก partner brand ภายนอก แต่ละ partner มี API format และ authentication ต่างกัน service นี้ทำหน้าที่ normalize ข้อมูลและตรวจสอบความถูกต้องก่อนส่งต่อให้ [[structure/synthetic-loyalty-rewards/module-points-ledger]] เพื่อ credit จริง

## ฟังก์ชันหลัก
- `processPartnerTransaction(partnerId: string, rawPayload: unknown): Promise<CreditRequest>` — แปลง transaction จาก format ของ partner เป็น format กลางของระบบ
- `confirmPendingCredit(transactionRef: string): Promise<void>` — ยืนยันว่า partner transaction ถูกต้อง สั่ง credit จริงใน [[structure/synthetic-loyalty-rewards/module-points-ledger]]
- `getPartnerSyncStatus(partnerId: string): Promise<SyncStatus>` — คืนสถานะ sync ล่าสุดของ partner รวมถึง error rate และ last successful sync

## ความสัมพันธ์กับ module อื่น

ดู [[business-logic/synthetic-loyalty-rewards/partner-conversion-policy]] สำหรับ conversion rate ของแต้มจาก partner แต่ละราย partner-sync ไม่ตัดสินใจ conversion rate เอง — แค่ส่งค่า raw amount มาให้ points-ledger ซึ่งเป็นคนคำนวณ equivalent points ให้
