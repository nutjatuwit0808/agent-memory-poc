---
layer: business-logic
tags: [data, retention, compliance, policy]
created: 2025-12-15
---

# นโยบายการเก็บข้อมูล Transaction ประวัติศาสตร์

ข้อมูล point transaction ทั้งหมดเก็บไว้ตลอดไปในรูปแบบ append-only เพื่อรองรับการตรวจสอบย้อนหลัง ข้อมูล personal data ของสมาชิกที่ปิดบัญชีจะถูก anonymize หลัง 2 ปี แต่ยอด transaction ยังคงอยู่ในรูปแบบ anonymized เพื่อความถูกต้องทางบัญชี

ข้อมูลที่เกิน 7 ปีจะถูก archive ไปยัง cold storage โดยอัตโนมัติ ยังเรียกดูได้แต่ช้ากว่า ทีม compliance เป็นผู้กำหนด archive schedule ตาม regulation ของแต่ละ market
