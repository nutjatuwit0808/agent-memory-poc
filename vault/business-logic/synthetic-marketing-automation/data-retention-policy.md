---
layer: business-logic
tags: [data, retention, policy]
created: 2026-03-18
---

# นโยบายการเก็บรักษาข้อมูลผู้รับ

ข้อมูล contact ที่ opted_out เกิน 2 ปีติดต่อกันโดยไม่มี interaction ใดๆ (ไม่เปิดอีเมล ไม่คลิก) จะถูก anonymize อัตโนมัติ เก็บไว้แค่สถิติรวมสำหรับ report ย้อนหลัง ไม่เก็บข้อมูลระบุตัวตนต่อ

record ใน `consent_records` ไม่ถูกลบทิ้งแม้ contact จะถูก anonymize แล้ว เพราะต้องเก็บหลักฐานว่าเคย honor คำขอ unsubscribe จริงไว้เพื่อการตรวจสอบทางกฎหมาย
