---
layer: business-logic
tags: [points, earning, refund, edge-case]
created: 2026-08-11
links:
  - "[[business-logic/synthetic-loyalty-rewards/points-earning-rate-policy]]"
---

# กรณียอดซื้อที่ถูก refund หลังได้แต้มไปแล้ว

ถ้าสมาชิกได้รับแต้มจาก transaction แล้วภายหลัง transaction นั้นถูก refund ระบบจะ debit แต้มที่ได้ไปคืนทันทีตามยอด refund จริง ถ้าสมาชิกใช้แต้มเหล่านั้นไปแล้วบางส่วน balance จะติดลบชั่วคราวจนกว่าจะได้แต้มใหม่มาเติม

กรณี balance ติดลบเกิน 30 วันโดยไม่มีกิจกรรมใหม่ ระบบจะแจ้งเตือนสมาชิกและ lock การแลกรางวัลชั่วคราวจนกว่า balance จะกลับมาเป็นบวก ไม่ตัด tier ของสมาชิกออกเพราะ balance ติดลบเพียงอย่างเดียว เพราะ tier คำนวณจากยอดสะสมรายปีแยกต่างหาก

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-loyalty-rewards/points-earning-rate-policy]] ("นโยบายอัตราการสะสมแต้มตาม Tier") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
