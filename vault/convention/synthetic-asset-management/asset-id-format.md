---
layer: convention
tags: [naming, registry]
created: 2026-04-21
---

# Asset ID Format

รูปแบบ asset_id ต้องตรงกันระหว่างระบบ AssetTrack และ label ทางกายภาพที่ติดบนสินทรัพย์จริง ความไม่ตรงกันทำให้ audit พบปัญหาที่ตามแก้ยาก

## รูปแบบ

`AT-<4 หลัก>` เช่น `AT-0001`, `AT-2241` — ตัวอักษรพิมพ์ใหญ่เสมอ คั่นด้วย `-` เท่านั้น ห้ามใช้ underscore หรือช่องว่าง

## กติกา

ห้ามนำ asset_id เก่าที่ dispose แล้วมาใช้ซ้ำ — running number วิ่งขึ้นเสมอ ไม่ recycle เพื่อให้ audit trail ไม่ปนกัน
