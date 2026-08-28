---
layer: business-logic
tags: [procurement, overspend, edge-case]
created: 2026-06-06
links:
  - "[[structure/synthetic-asset-management/module-procurement-handler]]"
  - "[[business-logic/synthetic-asset-management/procurement-approval-tier-policy]]"
---

# ข้อยกเว้น: Request ที่อนุมัติเกินวงเงิน Tier

ถ้า procurement request ได้รับการอนุมัติแล้วแต่มูลค่าจริงเมื่อได้รับสินค้าเกินกว่าที่ approved ไว้เกิน 5% จะต้องยื่น variance request แยกต่างหากสำหรับส่วนที่เกิน และรอ approval จาก tier ที่เหมาะสมกับมูลค่าทั้งหมด

[[structure/synthetic-asset-management/module-procurement-handler]] จะบล็อกการเรียก `markAsReceived` ถ้ามูลค่าจริงเกินที่อนุมัติไว้เกินเกณฑ์ จนกว่า variance request จะได้รับการอนุมัติ — เพื่อให้มั่นใจว่าทุก penny ที่ใช้ไปมี authorization ที่ถูกต้อง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-asset-management/procurement-approval-tier-policy]] ("นโยบาย Tier การอนุมัติ Procurement Request") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
