---
layer: business-logic
tags: [velocity, configuration, holiday, edge-case]
created: 2026-08-01
links:
  - "[[business-logic/synthetic-fraud-detection/velocity-window-config-policy]]"
---

# Velocity Window สำหรับ Event ระหว่าง Holiday Season

ช่วง major holiday (เช่น New Year, Songkran) velocity ปกติสูงขึ้นอย่างมีนัยสำคัญแม้สำหรับผู้ใช้จริงทั่วไป ทำให้ threshold ปกติ trigger false positive จำนวนมาก ระบบรองรับ "holiday mode" ที่ขยาย window และเพิ่ม threshold สำหรับ dimension ที่ได้รับผลกระทบ

holiday mode ต้องตั้งค่าล่วงหน้าอย่างน้อย 48 ชั่วโมงก่อนเทศกาล และมีกำหนดวันหมดอายุชัดเจน ไม่มีกรณีที่ holiday mode เปิดค้างไว้โดยไม่มีวันสิ้นสุด เพราะจะลด sensitivity ของระบบอย่างถาวร

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-fraud-detection/velocity-window-config-policy]] ("นโยบายการตั้งค่า Velocity Window") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
