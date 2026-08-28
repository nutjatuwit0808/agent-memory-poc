---
layer: business-logic
tags: [assessment, retake, cooldown, policy]
created: 2026-01-21
links:
  - "[[business-logic/synthetic-e-learning/retake-cooldown-policy-edge-cases]]"
---

# นโยบาย Cooldown ก่อน Retake Assessment

ผู้เรียนที่สอบไม่ผ่านต้องรอ `RETAKE_COOLDOWN_HOURS` ชั่วโมงก่อนจะ request retake ได้ เพื่อให้มีเวลา review เนื้อหาก่อนลองใหม่ และป้องกัน brute-force ที่ลองสุ่มคำตอบซ้ำๆ

จำนวน retake ไม่จำกัดสำหรับคอร์สทั่วไป แต่คอร์ compliance ที่ sensitive สามารถกำหนดจำนวน attempt สูงสุดได้ เมื่อครบ max attempt ต้องให้ supervisor สั่ง reset ด้วยมือเพื่อป้องกันการใช้สิทธิ์ retake เป็น shortcut

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-e-learning/retake-cooldown-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
