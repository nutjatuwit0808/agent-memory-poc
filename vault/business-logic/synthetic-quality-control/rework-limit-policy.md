---
layer: business-logic
tags: [rework, limit, policy]
created: 2026-03-31
---

# นโยบายขีดจำกัดรอบ Rework

batch หนึ่งชิ้นเข้า rework ได้สูงสุด `BATCH_MAX_REWORK_CYCLES` รอบ หลังจากนั้นถ้ายังไม่ผ่านจะถูก quarantine อัตโนมัติโดยไม่มีข้อยกเว้น เพราะการ rework ซ้ำซ้อนมักสร้างความเสียหายเพิ่มและเพิ่มต้นทุนโดยไม่ได้ผล

รอบ rework นับแบบ cumulative ต่อ batch_id เดียวกัน แม้ผู้อนุมัติ rework แต่ละรอบจะต่างกัน
