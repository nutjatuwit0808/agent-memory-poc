---
layer: business-logic
tags: [signal, retention, policy]
created: 2025-11-28
links:
  - "[[structure/synthetic-fraud-detection/module-signal-collector]]"
---

# นโยบายการเก็บรักษา Signal

raw signal ที่ [[structure/synthetic-fraud-detection/module-signal-collector]] รับเข้ามาถูกเก็บไว้ 90 วันใน hot storage แล้ว archive ไปยัง cold storage ต่ออีก 3 ปีเพื่อรองรับ regulatory requirement และการ forensic investigation

ข้อมูลที่ถือว่า PII (เช่น email, phone number ที่ผ่าน signal) ต้องผ่าน pseudonymization ก่อน archive โดยเก็บ mapping key ไว้แยกต่างหากพร้อม access control ที่เข้มงวดกว่า
