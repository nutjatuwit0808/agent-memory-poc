---
layer: structure
tags: [dunning, module, core]
created: 2026-01-12
links:
  - "[[business-logic/synthetic-subscription-billing/dunning-retry-schedule-policy]]"
---

# Module: dunning-engine

จัดการกระบวนการเรียกเก็บเงินซ้ำเมื่อการชำระเงินครั้งแรกล้มเหลว ตามตารางเวลา retry ที่กำหนด และตัดสินใจว่าเมื่อไหร่ต้องระงับบริการถ้ายังชำระไม่สำเร็จ เป็นจุดเดียวที่ตัดสินใจ retry schedule ไม่มี service อื่นเรียกเก็บเงินซ้ำเอง

## ฟังก์ชันหลัก
- `startDunningProcess(subscriptionId: string, failedInvoiceId: string): Promise<string>` — เริ่มกระบวนการ dunning เมื่อการชำระเงินล้มเหลว คืน dunningId
- `retryPayment(dunningId: string): Promise<PaymentResult>` — ลองเรียกเก็บเงินซ้ำตามรอบที่กำหนด
- `suspendService(subscriptionId: string): Promise<void>` — ระงับบริการเมื่อ dunning ครบทุกรอบแล้วยังไม่สำเร็จ

## State

retry_scheduled → retry_1 → retry_2 → retry_3 → resolved | suspended — ดู [[business-logic/synthetic-subscription-billing/dunning-retry-schedule-policy]]

## ความสัมพันธ์กับ module อื่น

subscribe event `payment.failed` จาก payment processor ภายนอกเพื่อเริ่มกระบวนการอัตโนมัติ ไม่รอให้ทีม billing เริ่มด้วยมือ
