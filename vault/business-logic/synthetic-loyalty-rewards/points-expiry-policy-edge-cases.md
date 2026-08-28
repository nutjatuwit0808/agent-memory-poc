---
layer: business-logic
tags: [expiry, redemption, edge-case]
created: 2026-05-13
links:
  - "[[business-logic/synthetic-loyalty-rewards/points-expiry-policy]]"
---

# แต้มหมดอายุระหว่างกระบวนการแลกรางวัล

ถ้าแต้มหมดอายุในช่วงที่ redemption order อยู่ใน `points_locked` state แต้มที่ lock ไว้จะถือว่ายัง valid จนกว่า lock จะหมดหรือ redemption จะสำเร็จ ระบบไม่ expire แต้มที่อยู่ใน lock เพราะสมาชิกกำลังดำเนินการแลกอยู่

ถ้า redemption ถูก cancel และแต้มคืนกลับมาหลังจาก expiry date ผ่านไปแล้ว แต้มที่คืนมาจะหมดอายุทันทีในรอบ expiry batch ถัดไป ไม่ได้ต่ออายุให้ใหม่เพียงเพราะผ่านกระบวนการ lock/unlock

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-loyalty-rewards/points-expiry-policy]] ("นโยบายหมดอายุของแต้ม") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
