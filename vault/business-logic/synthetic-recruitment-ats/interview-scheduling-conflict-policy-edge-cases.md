---
layer: business-logic
tags: [scheduling, edge-case]
created: 2026-06-28
links:
  - "[[business-logic/synthetic-recruitment-ats/interview-scheduling-conflict-policy]]"
---

# ข้อยกเว้นเมื่อ Interviewer ยกเลิกจากปฏิทินภายนอกโดยตรง

ถ้า interviewer ยกเลิกนัดจากปฏิทินภายนอก (Google Calendar/Outlook) โดยตรงแทนที่จะยกเลิกผ่าน TalentFlow ระบบจะไม่ auto-cancel ฝั่งผู้สมัครทันทีที่ตรวจพบความไม่ตรงกันในรอบ sync — จะแจ้ง recruiter ให้ยืนยันก่อนว่าเป็นการยกเลิกจริงหรือแค่ปฏิทินหลุด sync ชั่วคราว เพราะเคยมีกรณีที่ sync ผิดพลาดทำให้นัดที่ยังดำเนินอยู่จริงถูกยกเลิกไปทั้งที่ผู้สมัครมาสัมภาษณ์แล้วไม่มีใครมารับ

ระหว่างรอ recruiter ยืนยัน ผู้สมัครยังเห็นสถานะนัดเดิมตามปกติ ไม่มีการแจ้งยกเลิกออกไปจนกว่าจะยืนยันแล้ว

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-recruitment-ats/interview-scheduling-conflict-policy]] ("นโยบายการชนกันของตารางสัมภาษณ์") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
