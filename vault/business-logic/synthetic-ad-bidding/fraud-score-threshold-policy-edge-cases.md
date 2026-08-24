---
layer: business-logic
tags: [fraud, allowlist, edge-case]
created: 2025-10-27
links:
  - "[[business-logic/synthetic-ad-bidding/fraud-score-threshold-policy]]"
---

# ข้อยกเว้นสำหรับ Publisher ที่อยู่ใน Allowlist

publisher ที่ผ่านการ verify ด้วยมือแล้วว่าเป็นพันธมิตรที่เชื่อถือได้ (อยู่ใน allowlist) จะได้ threshold ที่ผ่อนปรนกว่า — ต้องคะแนนถึง 90 ขึ้นไปถึงจะถูก block แทนที่จะเป็น 80 ปกติ เพราะ traffic pattern บางอย่างของ publisher กลุ่มนี้ (เช่น traffic พุ่งช่วง live event) มักทำให้คะแนนพื้นฐานสูงกว่าปกติทั้งที่เป็น traffic จริง

การเพิ่ม publisher เข้า allowlist ต้องผ่านการอนุมัติจากทีม trust & safety เท่านั้น ไม่ใช่ทีม engineering ตัดสินใจเองได้ เพราะเป็นการยอมรับความเสี่ยง fraud ที่สูงขึ้นในทางธุรกิจ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-ad-bidding/fraud-score-threshold-policy]] ("นโยบาย Threshold คะแนน Fraud") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
