---
layer: convention
tags: [naming, style]
created: 2026-01-03
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `provisionAccess`, `generateTaskList` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier ของพนักงาน

`hireId` เป็น UUID เสมอ ไม่ใช้เลขพนักงาน (`employeeId`) จาก HRIS โดยตรง เพราะ `employeeId` อาจยังไม่ถูกออกจนกว่าจะผ่าน background check
