---
layer: convention
tags: [audit, points, compliance]
created: 2025-10-25
---

# Points Audit Trail Convention

ทุก credit และ debit ต้องมี audit trail ที่ตรวจสอบย้อนหลังได้ตลอดเวลา — เอกสารนี้กำหนดว่า field อะไรต้องอยู่ใน transaction record ทุกรายการ

## Required fields

`transactionId`, `accountId`, `type`, `amount`, `balanceAfter`, `source`, `createdAt`, `requestedBy` — ขาดตัวใดตัวหนึ่งถือว่า incomplete record ต้องไม่ commit transaction นั้น

## Immutability

transaction record ที่ commit แล้วต้องไม่ถูกแก้ไขหรือลบเด็ดขาด ถ้าต้องแก้ไขผลลัพธ์ต้องทำโดยการ insert transaction ใหม่ (reversal) แทน
