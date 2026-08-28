---
layer: business-logic
tags: [velocity, configuration, policy]
created: 2026-06-28
links:
  - "[[structure/synthetic-fraud-detection/module-velocity-tracker]]"
  - "[[business-logic/synthetic-fraud-detection/velocity-window-config-policy-edge-cases]]"
---

# นโยบายการตั้งค่า Velocity Window

[[structure/synthetic-fraud-detection/module-velocity-tracker]] ใช้ time window ที่แตกต่างกันตาม dimension เช่น login attempt ใช้ window 5 นาที ส่วน account creation จาก IP เดียวกันใช้ window 1 ชั่วโมง การเลือก window ที่เหมาะสมต้องสมดุลระหว่าง sensitivity (จับ attack ได้เร็ว) และ specificity (ไม่ false positive กับ burst ปกติ)

การเปลี่ยน window config ต้องทดสอบกับ historical data ย้อนหลัง 30 วันก่อนเสมอ เพื่อวัด impact ต่อ false positive rate ก่อน deploy จริง ห้ามเปลี่ยนใน production โดยตรงโดยไม่ผ่าน testing

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-fraud-detection/velocity-window-config-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
