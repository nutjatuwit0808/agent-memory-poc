---
layer: convention
tags: [reliability, billing]
created: 2026-01-19
links:
  - "[[support-cases/synthetic-subscription-billing/case-9086]]"
  - "[[support-cases/synthetic-subscription-billing/case-2383]]"
---

# Financial Mutation Convention

เอกสารนี้กำหนดวิธีจัดการฟังก์ชันที่มีผลกระทบทางการเงินให้สอดคล้องกันทั้งระบบ เพราะข้อผิดพลาดในจุดนี้กระทบความไว้วางใจของลูกค้าโดยตรง

## หลักการทั่วไป

ทุกฟังก์ชันที่เรียกเก็บเงินหรือคำนวณยอดที่มีผลต่อใบแจ้งหนี้ต้องมี idempotency key เสมอ ไม่พึ่งพาว่า client จะไม่ retry ซ้ำ — บทเรียนจากทั้ง [[support-cases/synthetic-subscription-billing/case-9086]] และ [[support-cases/synthetic-subscription-billing/case-2383]] ที่เกิดปัญหาแบบเดียวกันในสองจุดต่างกัน

## การแก้ไขย้อนหลัง

ห้ามแก้ไขยอดในใบแจ้งหนี้ที่ออกไปแล้วโดยตรง ต้องสร้างเอกสารปรับปรุง (credit note หรือ additional invoice) แยกต่างหากเสมอ เพื่อรักษา audit trail ที่ตรวจสอบย้อนหลังได้ครบถ้วน
