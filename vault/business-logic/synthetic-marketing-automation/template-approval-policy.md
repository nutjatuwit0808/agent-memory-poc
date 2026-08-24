---
layer: business-logic
tags: [template, policy]
created: 2025-10-11
---

# นโยบายการอนุมัติ Template ก่อนใช้งาน

template ใหม่ต้องผ่าน `validateTemplateSyntax` และมีคนที่สองรีวิวเนื้อหาก่อนถูกใช้กับ campaign จริงเสมอ — ป้องกัน placeholder พิมพ์ผิดหรือลิงก์ unsubscribe หายไปโดยไม่ตั้งใจ

template ที่แก้ไขหลังผ่านการอนุมัติแล้วต้องกลับไปรออนุมัติใหม่อีกรอบเสมอ ไม่ถือว่าการแก้ไขเล็กน้อยยกเว้นได้
