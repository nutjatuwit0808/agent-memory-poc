---
layer: convention
tags: [git, commit, workflow]
created: 2026-01-15
links:
  - "[[convention/branch-naming]]"
---

# Commit Message Style

ใช้รูปแบบใกล้เคียง Conventional Commits แต่ตัดความซับซ้อนบางส่วนออก

## รูปแบบ

```
<type>: <หัวข้อสั้น ไม่เกิน 72 ตัวอักษร>

<รายละเอียด ถ้าจำเป็น อธิบาย "ทำไม" ไม่ใช่ "ทำอะไร">
```

## Type ที่ใช้

- `feat` — เพิ่มความสามารถใหม่
- `fix` — แก้บั๊ก
- `refactor` — ปรับโครงสร้างโค้ดโดยพฤติกรรมไม่เปลี่ยน
- `docs` — แก้เอกสารอย่างเดียว
- `chore` — งานบำรุงรักษา เช่น อัปเดต dependency

## กติกา

- หัวข้อใช้ imperative mood เช่น "fix refund timeout retry" ไม่ใช่ "fixed" หรือ "fixes"
- ห้าม commit message ที่บอกแค่ "update" หรือ "wip" เข้า branch `main`
- ถ้า commit เกี่ยวกับ incident ให้ใส่เลข case เช่น `fix: retry refund on gateway timeout (case-3401)`
- squash commit ย่อยๆ ก่อน merge — history บน `main` ควรอ่านเป็นเรื่องราวได้

ดูกติกาตั้งชื่อ branch คู่กันที่ [[convention/branch-naming]]
