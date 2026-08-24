---
layer: business-logic
tags: [schema, policy]
created: 2025-11-16
links:
  - "[[structure/synthetic-analytics-pipeline/module-schema-registry]]"
---

# นโยบายการรองรับ Schema เปลี่ยนแปลง

การเปลี่ยน schema ที่ [[structure/synthetic-analytics-pipeline/module-schema-registry]] จัดว่า backward compatible (เช่น เพิ่มคอลัมน์ใหม่ที่ nullable) จะถูกยอมรับและบันทึกเป็นเวอร์ชันใหม่อัตโนมัติโดยไม่ต้องมีคนอนุมัติ

การเปลี่ยนที่จัดว่า breaking change (เช่น ลบคอลัมน์, เปลี่ยนชนิดข้อมูล) จะถูกบล็อกไม่ให้ transform อัตโนมัติ ต้องมีทีมเจ้าของ dataset ปลายทางอนุมัติ mapping ใหม่ก่อนเสมอ เพราะ dashboard ที่ใช้ข้อมูลอยู่อาจพังถ้าเปลี่ยนแบบไม่แจ้งล่วงหน้า
