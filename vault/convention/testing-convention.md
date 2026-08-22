---
layer: convention
tags: [testing, quality]
created: 2026-03-05
links:
  - "[[convention/code-review-checklist]]"
---

# Testing Convention

## โครงสร้าง test file

ทุกไฟล์ implementation `foo.ts` มี test คู่กันที่ `foo.test.ts` ในโฟลเดอร์เดียวกัน ไม่แยก folder `__tests__` ต่างหาก

## สิ่งที่ต้องมี test เสมอ

- business logic ทุกไฟล์ใน `business-logic/` ของโค้ด (ไม่ใช่ vault นี้) ต้องมี unit test ครอบ branch หลักทุกเส้น
- payment/refund flow ต้องมี integration test ที่ยิงผ่าน mock gateway จริง ไม่ mock ที่ตัว service layer เพราะเคยเจอเคสที่ mock กับ prod behavior ไม่ตรงกันจน bug หลุด production

## Naming

- ชื่อ test case เป็นประโยคภาษาอังกฤษอธิบายพฤติกรรม เช่น `"rejects refund when order already refunded"` ไม่ใช่ `"test1"` หรือ `"should work"`

## Coverage

- ไม่ตั้ง threshold coverage เป็นตัวเลขตายตัว เพราะทำให้คนเขียน test ไร้ความหมายเพื่อไล่ตัวเลข — ใช้ code review เป็นตัวตัดสินแทนตาม [[convention/code-review-checklist]]
