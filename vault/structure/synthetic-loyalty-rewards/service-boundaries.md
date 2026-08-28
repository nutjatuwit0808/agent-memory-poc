---
layer: structure
tags: [loyalty-rewards, pointsvault, boundaries]
created: 2025-12-21
links:
  - "[[structure/synthetic-loyalty-rewards/module-points-ledger]]"
  - "[[structure/synthetic-loyalty-rewards/module-tier-calculator]]"
  - "[[structure/synthetic-loyalty-rewards/module-redemption-engine]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่แชร์ตารางข้ามกัน — [[structure/synthetic-loyalty-rewards/module-points-ledger]] เป็นเจ้าของยอดแต้มและประวัติ transaction ทั้งหมดของสมาชิก ส่วน [[structure/synthetic-loyalty-rewards/module-tier-calculator]] เก็บเฉพาะผลการคำนวณ tier ล่าสุดและเกณฑ์ที่ใช้ ไม่มี ledger raw data ของตัวเอง

[[structure/synthetic-loyalty-rewards/module-redemption-engine]] เป็น service เดียวที่ต้องอ่านยอดแต้มจาก [[structure/synthetic-loyalty-rewards/module-points-ledger]] และตรวจสอบ tier ใน [[structure/synthetic-loyalty-rewards/module-tier-calculator]] พร้อมกันก่อนอนุมัติการแลกรางวัล เหตุผลที่ยอมให้ service นี้ cross-query คือต้องเห็น balance และ tier สิทธิ์ ณ เวลาเดียวกันเพื่อป้องกัน race condition ระหว่างการแลก
