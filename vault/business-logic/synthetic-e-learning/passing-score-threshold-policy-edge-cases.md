---
layer: business-logic
tags: [assessment, passing-score, edge-case]
created: 2025-12-21
links:
  - "[[structure/synthetic-e-learning/module-certificate-issuer]]"
  - "[[structure/synthetic-e-learning/module-course-catalog]]"
  - "[[business-logic/synthetic-e-learning/passing-score-threshold-policy]]"
---

# ข้อยกเว้นเกณฑ์คะแนน: คอร์สที่มีหลาย Assessment Component

คอร์สที่มีทั้ง knowledge test และ practical assessment (เช่น คอร์ส safety ที่ต้องทั้งรู้ทฤษฎีและแสดงทักษะ) ต้องผ่าน threshold ของทุก component แยกกัน ไม่ใช่ average รวม — ผ่าน knowledge test 95% แต่ practical 60% ในคอร์สที่ require ผ่าน 70% ทั้งคู่ ถือว่าไม่ผ่าน

[[structure/synthetic-e-learning/module-certificate-issuer]] ต้องตรวจสอบ component list จาก [[structure/synthetic-e-learning/module-course-catalog]] ก่อนออก certificate เสมอ ไม่ใช่แค่ตรวจ overall score เพราะ course version ใหม่อาจเพิ่ม component ใหม่ได้

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-e-learning/passing-score-threshold-policy]] ("นโยบายเกณฑ์คะแนนผ่านการประเมิน") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
