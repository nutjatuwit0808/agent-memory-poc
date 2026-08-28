---
layer: business-logic
tags: [plagiarism, assessment, integrity, policy]
created: 2025-10-30
links:
  - "[[business-logic/synthetic-e-learning/plagiarism-detection-policy-edge-cases]]"
---

# นโยบายการตรวจสอบและจัดการ Plagiarism ใน Assessment

ระบบตรวจสอบ plagiarism สำหรับ assessment ประเภท written answer โดยเปรียบเทียบคำตอบของผู้เรียนกับ submission ทั้งหมดในช่วงเวลาเดียวกัน ถ้า similarity score เกิน threshold จะถูก flag ให้ instructor ตรวจสอบด้วยมือก่อน grade

การ flag เป็น plagiarism ไม่ได้หมายความว่าผิดโดยอัตโนมัติ — instructor ต้องตรวจสอบ context ก่อน เพราะ subject matter ที่ใกล้เคียงกันทำให้คำตอบที่ถูกต้องคล้ายกันโดยธรรมชาติ การ mark ว่าเป็น plagiarism จริงต้องมีหลักฐานที่ชัดเจนกว่าแค่ similarity score

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-e-learning/plagiarism-detection-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
