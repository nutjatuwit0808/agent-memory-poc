---
layer: business-logic
tags: [reminder, edge-case]
created: 2025-10-25
links:
  - "[[business-logic/synthetic-document-signing/envelope-expiration-policy]]"
  - "[[business-logic/synthetic-document-signing/reminder-frequency-policy]]"
---

# ข้อยกเว้นสำหรับ Envelope ที่ใกล้วันหมดอายุ

ถ้า envelope เหลือเวลาไม่ถึง 48 ชั่วโมงก่อนหมดอายุตาม [[business-logic/synthetic-document-signing/envelope-expiration-policy]] ระบบจะส่งเตือนพิเศษเพิ่มอีก 1 ครั้งนอกเหนือจากโควตาปกติ 3 ครั้ง โดยระบุชัดเจนว่าใกล้หมดอายุแล้ว เพราะความเสี่ยงที่ signer จะพลาดกำหนดเวลาสำคัญกว่าความเสี่ยงเรื่องสแปมในสถานการณ์นี้

เตือนพิเศษก่อนหมดอายุนี้ส่งได้แม้ signer จะเคยได้รับครบ 3 ครั้งแล้วก็ตาม แต่ยังต้องถูกยกเลิกทันทีเช่นเดิมถ้า signer เซ็นเสร็จก่อนเวลาที่กำหนดส่ง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-document-signing/reminder-frequency-policy]] ("นโยบายความถี่การแจ้งเตือนผู้เซ็น") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
