---
layer: business-logic
tags: [prescription, policy]
created: 2026-06-16
links:
  - "[[business-logic/synthetic-health-records/prescription-refill-limit-policy-edge-cases]]"
---

# นโยบายข้อจำกัดการเบิกยาซ้ำ

ใบสั่งยาแต่ละใบเบิกซ้ำได้สูงสุด `MAX_REFILL_COUNT_PER_PRESCRIPTION` ครั้ง และแต่ละครั้งต้องห่างจากครั้งก่อนหน้าอย่างน้อย `REFILL_MIN_INTERVAL_DAYS` วัน เพื่อป้องกันการใช้ยาเกินขนาดที่แพทย์สั่ง

เมื่อเบิกครบจำนวนครั้งสูงสุดแล้ว ระบบจะปฏิเสธการเบิกซ้ำโดยอัตโนมัติแม้จะยังไม่ถึงวันหมดอายุใบสั่งยาก็ตาม ต้องให้แพทย์ออกใบสั่งยาใหม่เท่านั้น

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-health-records/prescription-refill-limit-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
