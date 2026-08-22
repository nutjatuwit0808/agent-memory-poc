---
layer: convention
tags: [code-review, quality]
created: 2026-03-01
links:
  - "[[convention/naming-convention]]"
  - "[[convention/testing-convention]]"
---

# Code Review Checklist

ก่อน approve PR ให้เช็คหัวข้อเหล่านี้

## ความถูกต้อง

- [ ] logic ตรงกับ business requirement ที่ระบุใน ticket
- [ ] edge case ที่เห็นชัด (empty array, null, timeout) ถูกจัดการ
- [ ] ไม่มี race condition ที่มองเห็นได้ในโค้ดที่แตะ shared state

## Convention

- [ ] ชื่อตัวแปร/ฟังก์ชันตาม [[convention/naming-convention]]
- [ ] error code ใหม่ (ถ้ามี) มี prefix namespace ถูกต้อง
- [ ] ไม่มี `console.log` หลงเหลือ

## Test

- [ ] มี test ครอบ happy path และอย่างน้อย 1 edge case ตาม [[convention/testing-convention]]
- [ ] test ที่แก้ไขไม่ได้ถูก skip หรือ comment ออกเพื่อให้ CI ผ่าน

## ขนาด PR

- PR ที่เกิน 400 บรรทัด diff ควรถูกขอให้แตกเป็นหลาย PR ก่อน review ต่อ ยกเว้นเป็น auto-generated code
