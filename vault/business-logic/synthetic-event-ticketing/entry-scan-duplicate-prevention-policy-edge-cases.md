---
layer: business-logic
tags: [scanning, edge-case]
created: 2026-05-04
links:
  - "[[business-logic/synthetic-event-ticketing/entry-scan-duplicate-prevention-policy]]"
---

# ข้อยกเว้นสำหรับงานที่อนุญาตเข้า-ออกได้หลายครั้ง

งานบางประเภท (เทศกาลหลายวัน, งานที่มีโซนแยกที่ต้องเข้า-ออกระหว่างวัน) อนุญาตให้บัตรใบเดียวสแกนเข้า-ออกได้หลายครั้ง — ผู้จัดงานต้องตั้งค่า 'multi-entry allowed' ไว้ล่วงหน้าตั้งแต่สร้างงาน ไม่ใช่ค่า default

แม้จะเป็นงานแบบ multi-entry การสแกนเข้าซ้ำโดยไม่มีการสแกนออกก่อนหน้ายังคงถูกปฏิเสธเสมอ เพื่อป้องกันบัตรใบเดียวถูกใช้พร้อมกันสองที่แม้ในงานที่อนุญาตเข้า-ออกหลายครั้งก็ตาม

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-event-ticketing/entry-scan-duplicate-prevention-policy]] ("นโยบายป้องกันการสแกนบัตรซ้ำ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
