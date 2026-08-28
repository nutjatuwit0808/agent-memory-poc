---
layer: business-logic
tags: [plagiarism, false-positive, edge-case]
created: 2026-03-05
links:
  - "[[business-logic/synthetic-e-learning/plagiarism-detection-policy]]"
---

# ข้อยกเว้น Plagiarism Detection: กรณี False Positive จำนวนมาก

ถ้า assessment ชุดหนึ่งมี plagiarism flag เกิน 30% ของ submission ในรอบเดียวกัน ให้สงสัยก่อนว่าเป็น false positive จาก question design ที่ทำให้คำตอบที่ถูกต้องคล้ายกันโดยธรรมชาติ (เช่น คำถามที่มีคำตอบชัดเจนเพียงแบบเดียว) ไม่ใช่ plagiarism จริง

กรณีนี้ให้ review คำถามก่อน grade คำตอบ ถ้า question design ทำให้ตรวจ plagiarism ไม่ได้จริง ให้ปรับ question ใน version ถัดไปแทนการ flag ผู้เรียนทุกคน เพราะ false positive กระทบความน่าเชื่อถือของระบบและกระทบผู้เรียนที่ไม่ได้ทำผิดอะไร

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-e-learning/plagiarism-detection-policy]] ("นโยบายการตรวจสอบและจัดการ Plagiarism ใน Assessment") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
