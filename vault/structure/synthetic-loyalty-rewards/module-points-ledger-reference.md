---
layer: structure
tags: [points, ledger, module, core, reference, identifiers]
created: 2026-06-25
links:
  - "[[structure/synthetic-loyalty-rewards/module-points-ledger]]"
  - "[[business-logic/synthetic-loyalty-rewards/points-earning-rate-policy]]"
---

# points-ledger — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด points-ledger สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-loyalty-rewards/module-points-ledger]])

## Public functions
- `creditPoints(accountId: string, amount: number, source: PointSource, idempotencyKey: string): Promise<TransactionId>` — เพิ่มแต้มเข้าบัญชีพร้อม idempotency key เพื่อป้องกัน double credit
- `debitPoints(accountId: string, amount: number, reason: DebitReason): Promise<TransactionId>` — ตัดแต้มออกจากบัญชี ตรวจว่า balance เพียงพอก่อนเสมอ
- `getBalance(accountId: string): Promise<PointBalance>` — คืนยอดแต้มปัจจุบันและแต้มที่รอยืนยัน (pending)
- `getTransactionHistory(accountId: string, options: PaginationOptions): Promise<Transaction[]>` — ดึงประวัติ transaction พร้อม pagination

## Internal constants
- `PENDING_CREDIT_TTL_HOURS = 72`
- `MAX_SINGLE_CREDIT_POINTS = 100000`
- `IDEMPOTENCY_KEY_TTL_DAYS = 30`

## Type

```ts
interface Transaction {
  transactionId: string;
  accountId: string;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  source: string;
  createdAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่องอัตราการได้แต้มที่ [[business-logic/synthetic-loyalty-rewards/points-earning-rate-policy]]
