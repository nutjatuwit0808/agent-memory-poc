---
layer: convention
tags: [naming, style]
created: 2026-02-21
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `dispatchNextBatch`, `recomputeSegment` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier ของผู้รับ

`contactId` เป็น UUID เสมอ ห้ามใช้อีเมลเป็น primary key ในตารางไหนเลยแม้จะดูสะดวกกว่า เพราะอีเมลเปลี่ยนได้และมีผลต่อ consent record ที่ต้องผูกกับตัวตนเดิม
