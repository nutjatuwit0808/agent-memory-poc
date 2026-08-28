---
layer: structure
tags: [points, ledger, module, core]
created: 2026-01-29
links:
  - "[[structure/synthetic-loyalty-rewards/module-partner-sync]]"
  - "[[business-logic/synthetic-loyalty-rewards/partner-conversion-policy]]"
  - "[[structure/synthetic-loyalty-rewards/module-redemption-engine]]"
---

# Module: points-ledger

เจ้าของยอดแต้มและประวัติ transaction ทุกรายการของสมาชิก ออกแบบเป็น append-only ledger เพื่อให้ตรวจสอบย้อนหลังได้ทุกจุด ไม่มีการแก้ไขหรือลบ record ที่บันทึกไปแล้ว ยอดแต้มปัจจุบันคำนวณจาก sum ของ transaction ทั้งหมดในบัญชี แยกออกมาเป็น service อิสระเพราะ ledger เป็นหัวใจของระบบที่ต้องมี auditability สูงสุดและไม่ควรปนกับ business rule ชั้นอื่น

## ฟังก์ชันหลัก
- `creditPoints(accountId: string, amount: number, source: PointSource, idempotencyKey: string): Promise<TransactionId>` — เพิ่มแต้มเข้าบัญชีพร้อม idempotency key เพื่อป้องกัน double credit
- `debitPoints(accountId: string, amount: number, reason: DebitReason): Promise<TransactionId>` — ตัดแต้มออกจากบัญชี ตรวจว่า balance เพียงพอก่อนเสมอ
- `getBalance(accountId: string): Promise<PointBalance>` — คืนยอดแต้มปัจจุบันและแต้มที่รอยืนยัน (pending)
- `getTransactionHistory(accountId: string, options: PaginationOptions): Promise<Transaction[]>` — ดึงประวัติ transaction พร้อม pagination

## State

pending_credit → confirmed | voided — แต้มที่ partner ส่งมายังไม่ยืนยันอยู่ใน pending นานสูงสุด 72 ชั่วโมง ถ้าไม่ได้รับยืนยันจาก [[structure/synthetic-loyalty-rewards/module-partner-sync]] จะถูก void อัตโนมัติ ดู [[business-logic/synthetic-loyalty-rewards/partner-conversion-policy]]

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-loyalty-rewards/module-redemption-engine]] เรียก `getBalance` ก่อน debit ทุกครั้ง แต่ points-ledger ไม่รู้จัก concept ของ reward catalog หรือ redemption order เลย — รู้แค่ debit amount และ reason ที่จัดหมวดไว้แล้ว การตัดสินใจว่า debit ได้หรือไม่อยู่ที่ redemption-engine
