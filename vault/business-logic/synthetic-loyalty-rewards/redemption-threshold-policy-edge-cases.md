---
layer: business-logic
tags: [redemption, tier, grace-period, edge-case]
created: 2026-03-18
links:
  - "[[business-logic/synthetic-loyalty-rewards/redemption-threshold-policy]]"
---

# การแลกรางวัลขณะอยู่ใน Tier Downgrade Grace Period

สมาชิกที่อยู่ใน grace period ของการ downgrade tier ยังคงแลกรางวัลในสิทธิ์ tier เดิมได้ตลอด grace period นั้น ไม่ใช่สิทธิ์ tier ใหม่

เมื่อ grace period สิ้นสุด สิทธิ์จะปรับเป็น tier ใหม่ทันที ไม่มีการขยาย grace period ซ้อนกันแม้สมาชิกจะซื้อเพิ่มเล็กน้อยในช่วงนั้น ต้องทำยอดให้ถึง threshold ของ tier เดิมภายใน grace period ถึงจะรักษา tier ไว้ได้

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-loyalty-rewards/redemption-threshold-policy]] ("นโยบายเกณฑ์ขั้นต่ำและสิทธิ์การแลกรางวัล") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
