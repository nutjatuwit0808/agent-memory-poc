---
layer: business-logic
tags: [orchestration, policy]
created: 2026-07-16
---

# นโยบายลำดับความสำคัญของ Job ใน DAG

job ที่ป้อนข้อมูลให้ dashboard ระดับผู้บริหาร (จัดกลุ่ม `executive_facing`) ได้ priority สูงสุดในการแย่ง compute เมื่อ `DAG_MAX_CONCURRENT_JOBS` เต็ม — job อื่นที่รอคิวจะถูก queue ต่อจนกว่า job กลุ่มนี้จะรันเสร็จก่อน

job ที่ทำ ad-hoc analysis สำหรับทีมเดียว (ไม่ได้ป้อน dashboard ที่ใช้งานร่วมกัน) ได้ priority ต่ำสุดเสมอ แม้จะ trigger แบบ manual ก็ตาม เพื่อไม่ให้แย่งทรัพยากรจาก scheduled job หลักที่ธุรกิจพึ่งพา
