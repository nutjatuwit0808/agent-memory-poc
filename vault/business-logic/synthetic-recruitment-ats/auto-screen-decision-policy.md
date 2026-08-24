---
layer: business-logic
tags: [screening, policy]
created: 2025-10-25
links:
  - "[[structure/synthetic-recruitment-ats/module-resume-parser]]"
  - "[[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]]"
  - "[[business-logic/synthetic-recruitment-ats/auto-screen-decision-policy-edge-cases]]"
---

# นโยบายการ Auto-screen ผู้สมัครจากผลแกะ Resume

เมื่อ [[structure/synthetic-recruitment-ats/module-resume-parser]] แกะข้อมูลเสร็จและ `computeConfidenceScore` คืนค่าสูงกว่า `PARSER_LOW_CONFIDENCE_THRESHOLD` ระบบจะให้ [[structure/synthetic-recruitment-ats/module-candidate-pipeline-tracker]] เทียบ criteria พื้นฐาน (ประสบการณ์ขั้นต่ำ, ทักษะบังคับ) อัตโนมัติ ถ้าไม่ผ่านจะย้ายไป `rejected` โดยไม่ต้องรอ recruiter ตรวจก่อน

confidence score ต่ำกว่า threshold จะไม่ auto-screen เด็ดขาด ไม่ว่าผลจะออกมาผ่านหรือไม่ผ่านเกณฑ์ก็ตาม — ต้องส่งเข้าคิวให้ recruiter ตรวจด้วยตาก่อนเสมอ เพราะข้อมูลที่แกะมาความน่าเชื่อถือต่ำอาจทำให้ตัดสินใจผิดพลาด

## ทำไมไม่ auto-reject ทุกกรณีที่ไม่ผ่านเกณฑ์

การ auto-reject จากข้อมูลที่แกะผิดพลาดอาจทำให้ผู้สมัครที่มีคุณสมบัติจริงถูกปฏิเสธอย่างไม่เป็นธรรม ทีมจึงจำกัด auto-screen ไว้เฉพาะกรณีที่ confidence สูงพอเท่านั้น ส่วนกรณีคลุมเครือให้คนตัดสินใจแทนเสมอ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-recruitment-ats/auto-screen-decision-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
