---
layer: business-logic
tags: [energy, conflict, policy]
created: 2025-11-13
links:
  - "[[structure/synthetic-smart-building/module-energy-optimizer]]"
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
  - "[[business-logic/synthetic-smart-building/energy-optimizer-conflict-resolution-policy-edge-cases]]"
---

# นโยบายการชนกันระหว่าง Energy Optimizer กับ Manual Override

[[structure/synthetic-smart-building/module-energy-optimizer]] ส่งคำแนะนำ setpoint ทุก `OPT_INTERVAL_MS` แต่ [[structure/synthetic-smart-building/module-hvac-controller]] จะปฏิเสธคำแนะนำทุกครั้งที่โซนนั้นมี manual override ที่ยังไม่หมดอายุอยู่ ไม่มีข้อยกเว้น

จำนวนครั้งที่ optimizer ปรับ setpoint ของโซนเดียวกันในหนึ่งวันถูกจำกัดที่ `OPT_MAX_DAILY_ADJUSTMENTS_PER_ZONE` เพื่อป้องกัน oscillation ที่เกิดจากการคำนวณแกว่งไปมาระหว่างรอบ

## ทำไมจำกัดจำนวนครั้งต่อวันแทนที่จะแก้สูตรคำนวณให้เสถียรกว่าเดิม

ทีมเคยพยายามแก้สูตรให้เสถียรขึ้นแต่พบว่าปัจจัยภายนอก (ราคาไฟ, demand response signal) เปลี่ยนเร็วกว่าที่สูตรจะไล่ตามทันจริงๆ การจำกัดจำนวนครั้งเป็นทางแก้ที่ deterministic และเข้าใจง่ายกว่าการพยายาม tune สูตรให้สมบูรณ์แบบ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-smart-building/energy-optimizer-conflict-resolution-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
