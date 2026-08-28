---
layer: structure
tags: [dunning, module, core, reference, identifiers]
created: 2026-03-11
links:
  - "[[structure/synthetic-subscription-billing/module-dunning-engine]]"
  - "[[business-logic/synthetic-subscription-billing/dunning-retry-schedule-policy]]"
---

# dunning-engine — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด dunning-engine สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-subscription-billing/module-dunning-engine]])

## Public functions
- `startDunningProcess(subscriptionId: string, failedInvoiceId: string): Promise<string>` — เริ่มกระบวนการ dunning เมื่อการชำระเงินล้มเหลว คืน dunningId
- `retryPayment(dunningId: string): Promise<PaymentResult>` — ลองเรียกเก็บเงินซ้ำตามรอบที่กำหนด
- `suspendService(subscriptionId: string): Promise<void>` — ระงับบริการเมื่อ dunning ครบทุกรอบแล้วยังไม่สำเร็จ

## Internal constants
- `DUNNING_MAX_RETRY_COUNT = 3`
- `DUNNING_RETRY_INTERVAL_DAYS = 3`

## Type

```ts
interface DunningStatus {
  dunningId: string;
  subscriptionId: string;
  retryCount: number;
  status: "active" | "resolved" | "suspended";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องตารางเวลา retry ที่ [[business-logic/synthetic-subscription-billing/dunning-retry-schedule-policy]]
