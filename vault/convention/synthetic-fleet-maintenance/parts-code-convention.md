---
layer: convention
tags: [naming, parts]
created: 2025-11-17
---

# Parts Code Convention

รหัสอะไหล่ต้องตรงกับ OEM part number หรือ cross-reference number ที่ตกลงกับ vendor แต่ละราย ไม่ใช้ชื่อย่อที่คิดเองภายใน

## รูปแบบใน system

`<CATEGORY>-<OEM-NUMBER>` เช่น `BP-220` (brake pad), `OF-4412` (oil filter), `TRE-195` (tyre) — category prefix 2-3 ตัวอักษร uppercase

## Cross-reference

ถ้า vendor ใช้รหัสต่างกัน ต้องเก็บ vendor part number ไว้ใน cross-reference table แยก ไม่ rename รหัสหลักในระบบ เพื่อให้รหัสกลางมีที่เดียว
