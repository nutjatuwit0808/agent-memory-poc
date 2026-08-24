---
layer: business-logic
tags: [storage, edge-case]
created: 2026-01-03
links:
  - "[[support-cases/synthetic-video-streaming/case-2925]]"
  - "[[business-logic/synthetic-video-streaming/storage-quota-policy]]"
---

# ข้อยกเว้นเมื่อโควตาหมดระหว่างอัปโหลดที่กำลังทำอยู่

ถ้า publisher มีอัปโหลดแบบ multi-part ที่เริ่มไปแล้วตอนที่ยังมีโควตาเหลือ แต่ account ใช้โควตาหมดจากการอัปโหลดไฟล์อื่นพร้อมกันก่อนไฟล์นี้เสร็จ ระบบจะปล่อยให้อัปโหลดที่เริ่มไปแล้วทำต่อจนจบ ไม่ตัดกลางคัน เพราะไฟล์ที่ถูกตัดกลาง multi-part upload จะกลายเป็นไฟล์เสียที่กู้คืนไม่ได้ — ดู [[support-cases/synthetic-video-streaming/case-2925]]

หลังอัปโหลดที่เกินโควตาเสร็จแล้ว account จะถูกล็อกไม่ให้อัปโหลดไฟล์ใหม่จนกว่าจะลบของเก่าหรืออัปเกรด plan แต่ไฟล์ที่มีอยู่แล้วยังเล่นได้ปกติ ไม่ถูกลบหรือระงับการเข้าถึง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-video-streaming/storage-quota-policy]] ("นโยบายโควตาพื้นที่จัดเก็บของ Publisher") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
