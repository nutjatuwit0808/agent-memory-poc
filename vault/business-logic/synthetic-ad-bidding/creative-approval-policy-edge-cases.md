---
layer: business-logic
tags: [creative, availability, edge-case]
created: 2025-09-11
links:
  - "[[structure/synthetic-ad-bidding/module-creative-renderer]]"
  - "[[business-logic/synthetic-ad-bidding/creative-approval-policy]]"
---

# ข้อยกเว้นเมื่อ Creative Approval Service ล่ม

ถ้า service ตรวจสอบ approval ตอบไม่ทันภายใน timeout ที่กำหนด (แยกจาก time budget หลักของ bid request) [[structure/synthetic-ad-bidding/module-creative-renderer]] จะ fail-safe ไปใช้ผลอนุมัติล่าสุดที่ cache ไว้ (แม้จะเกิน 5 นาที) แทนที่จะ block การแสดงผลทั้งหมด เพราะการเสีย revenue ทั้งระบบเพราะ dependency เดียวล่มมีความเสี่ยงสูงกว่า

โหมด fail-safe นี้มีเพดานเวลาไม่เกิน 15 นาที — ถ้า approval service ยังไม่กลับมาเกิน 15 นาที ระบบจะเปลี่ยนเป็น fail-closed (ไม่แสดง creative ที่ไม่ได้ตรวจสอบสดเลย) เพื่อจำกัดความเสี่ยงไม่ให้ลากยาวเกินไป

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-ad-bidding/creative-approval-policy]] ("นโยบายการอนุมัติ Creative") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
